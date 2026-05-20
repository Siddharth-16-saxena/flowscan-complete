const Workflow = require('../models/Workflow');
const Task = require('../models/Task');
const Analysis = require('../models/Analysis');
const { enrichTasks } = require('../utils/task-enrichment');

/**
 * GET /dashboard
 * Aggregated stats across all workflows
 */
const getDashboard = async (req, res, next) => {
  try {
    const [
      totalWorkflows,
      recentWorkflows,
      aggregateMetrics,
    ] = await Promise.all([
      Workflow.countDocuments(),
      Workflow.find()
        .sort({ uploaded_at: -1 })
        .limit(5)
        .select('name original_filename file_type uploaded_at status task_count')
        .lean(),
      Analysis.aggregate([
        {
          $group: {
            _id: null,
            avg_efficiency: { $avg: '$metrics.efficiency_score' },
            total_bottlenecks: { $sum: '$metrics.bottleneck_count' },
            avg_duration: { $avg: '$metrics.avg_duration_minutes' },
            total_idle: { $sum: '$metrics.total_idle_minutes' },
          },
        },
      ]),
    ]);

    const agg = aggregateMetrics[0] || {
      avg_efficiency: 0,
      total_bottlenecks: 0,
      avg_duration: 0,
      total_idle: 0,
    };

    // Get latest workflow's full analysis for display
    let latestWorkflow = null;
    let latestWorkflowTasks = [];
    let latestWorkflowAnalysis = null;

    if (recentWorkflows.length > 0) {
      const wfId = recentWorkflows[0]._id;
      latestWorkflow = recentWorkflows[0];
      latestWorkflowTasks = await Task.find({ workflow_id: wfId }).sort({ sequence_order: 1 }).lean();
      latestWorkflowAnalysis = await Analysis.findOne({ workflow_id: wfId }).lean();
    }

    const enrichedTasks = enrichTasks(latestWorkflowTasks, latestWorkflowAnalysis || {});

    return res.json({
      summary: {
        total_workflows: totalWorkflows,
        avg_efficiency_score: Math.round(agg.avg_efficiency || 0),
        total_bottlenecks_detected: agg.total_bottlenecks || 0,
        avg_duration_minutes: Math.round(agg.avg_duration || 0),
        total_idle_minutes: agg.total_idle || 0,
      },
      recent_workflows: recentWorkflows,
      tasks: enrichedTasks,
      analysis: latestWorkflowAnalysis
        ? {
            ...latestWorkflowAnalysis,
            metrics: {
              ...(latestWorkflowAnalysis.metrics || {}),
              total_tasks: latestWorkflowTasks.length,
            },
          }
        : null,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard };
