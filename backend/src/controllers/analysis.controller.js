const mongoose = require('mongoose');
const Workflow = require('../models/Workflow');
const Task = require('../models/Task');
const Analysis = require('../models/Analysis');
const { analyzeWorkflow } = require('../services/ai.service');
const { enrichTasks } = require('../utils/task-enrichment');

/**
 * GET /analysis/:id
 * Fetch workflow + tasks, call AI service, return full analysis
 */
const getAnalysis = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid workflow ID.' });
    }

    const workflow = await Workflow.findById(id).lean();
    if (!workflow) return res.status(404).json({ error: 'Workflow not found.' });

    const tasks = await Task.find({ workflow_id: id }).sort({ sequence_order: 1 }).lean();
    if (!tasks.length) return res.status(404).json({ error: 'No tasks found for this workflow.' });

    // Check if analysis already cached
    let analysis = await Analysis.findOne({ workflow_id: id });

    if (!analysis) {
      // Re-run analysis
      const result = await analyzeWorkflow(tasks);
      analysis = await Analysis.create({ workflow_id: id, ...result });
      await Workflow.findByIdAndUpdate(id, { status: 'analyzed' });
    }

    const normalizedAnalysis = typeof analysis.toObject === 'function' ? analysis.toObject() : analysis;
    const enrichedTasks = enrichTasks(tasks, normalizedAnalysis);

    return res.json({
      workflow: {
        id: workflow._id,
        name: workflow.name,
        uploaded_at: workflow.uploaded_at,
        status: workflow.status,
        task_count: workflow.task_count,
      },
      tasks: enrichedTasks,
      analysis: normalizedAnalysis,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /analysis/:id/rerun
 * Force re-run the analysis
 */
const rerunAnalysis = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid ID.' });

    const tasks = await Task.find({ workflow_id: id }).sort({ sequence_order: 1 }).lean();
    if (!tasks.length) return res.status(404).json({ error: 'No tasks found.' });

    const result = await analyzeWorkflow(tasks);
    const analysis = await Analysis.findOneAndUpdate(
      { workflow_id: id },
      { ...result, analyzed_at: new Date() },
      { upsert: true, new: true }
    );

    const enrichedTasks = enrichTasks(tasks, result);
    await Task.bulkWrite(
      enrichedTasks.map((task) => ({
        updateOne: {
          filter: { _id: task._id },
          update: {
            $set: {
              is_bottleneck: task.is_bottleneck,
              has_idle_before: task.has_idle_before,
              idle_gap_minutes: task.idle_gap_minutes,
            },
          },
        },
      }))
    );

    return res.json({ message: 'Analysis re-run successfully.', analysis });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAnalysis, rerunAnalysis };
