const path = require('path');
const fs = require('fs');
const Workflow = require('../models/Workflow');
const Task = require('../models/Task');
const Analysis = require('../models/Analysis');
const { parseWorkflowFile } = require('../services/parser.service');
const { analyzeWorkflow } = require('../services/ai.service');
const { enrichTasks } = require('../utils/task-enrichment');

/**
 * POST /upload
 * Accept CSV/JSON, parse, store tasks, run analysis
 */
const uploadWorkflow = async (req, res, next) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file uploaded.' });

  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  let workflow;

  try {
    // 1. Parse file
    const parsedTasks = await parseWorkflowFile(file.path);
    if (!parsedTasks.length) {
      return res.status(422).json({ error: 'File contains no valid task rows.' });
    }

    // 2. Create workflow record
    workflow = await Workflow.create({
      name: req.body.name || path.basename(file.originalname, path.extname(file.originalname)),
      original_filename: file.originalname,
      file_type: ext,
      task_count: parsedTasks.length,
      status: 'processing',
    });

    // 3. Store tasks
    // 4. Run AI analysis
    const analysisResult = await analyzeWorkflow(parsedTasks);

    // 5. Store enriched tasks in a single bulk insert
    const enrichedTasks = enrichTasks(
      parsedTasks.map((task, index) => ({
        ...task,
        workflow_id: workflow._id,
        sequence_order: index,
      })),
      analysisResult
    );
    await Task.insertMany(enrichedTasks);

    // 6. Store analysis
    await Analysis.create({ workflow_id: workflow._id, ...analysisResult });

    // 7. Mark workflow complete
    await Workflow.findByIdAndUpdate(workflow._id, { status: 'analyzed' });

    // 8. Cleanup temp file
    fs.unlink(file.path, () => {});

    return res.status(201).json({
      workflow_id: workflow._id,
      name: workflow.name,
      task_count: parsedTasks.length,
      message: 'Workflow uploaded and analyzed successfully.',
    });
  } catch (err) {
    if (workflow) await Workflow.findByIdAndUpdate(workflow._id, { status: 'error' });
    if (file?.path) fs.unlink(file.path, () => {});
    next(err);
  }
};

module.exports = { uploadWorkflow };
