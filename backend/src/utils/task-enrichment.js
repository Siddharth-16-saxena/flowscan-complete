const { timeToMinutes } = require('../services/parser.service');

function extractBottleneckNames(analysisResult = {}) {
  return new Set(
    (analysisResult.bottlenecks || [])
      .map((message) => {
        const match = String(message).match(/"([^"]+)"/);
        return match ? match[1] : null;
      })
      .filter(Boolean)
  );
}

function enrichTasks(tasks = [], analysisResult = {}) {
  const bottleneckNames = extractBottleneckNames(analysisResult);

  return tasks.map((task, index) => {
    const previousTask = tasks[index - 1];
    const idleGapMinutes = previousTask
      ? Math.max(0, timeToMinutes(task.start_time) - timeToMinutes(previousTask.end_time))
      : 0;

    return {
      ...task,
      is_bottleneck: bottleneckNames.has(task.task_name),
      has_idle_before: idleGapMinutes > 0,
      idle_gap_minutes: idleGapMinutes,
    };
  });
}

module.exports = { extractBottleneckNames, enrichTasks };
