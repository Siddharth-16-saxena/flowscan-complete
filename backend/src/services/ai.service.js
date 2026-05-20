const axios = require('axios');

const AI_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const aiClient = axios.create({
  baseURL: AI_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Send tasks to AI service for bottleneck analysis
 * Falls back to local analysis if AI service is unavailable
 */
async function analyzeWorkflow(tasks) {
  try {
    const response = await aiClient.post('/analyze', { tasks });
    return response.data;
  } catch (err) {
    console.warn('⚠️  AI service unavailable, running local fallback analysis');
    return localFallbackAnalysis(tasks);
  }
}

/**
 * Simple local fallback analysis when AI service is down
 */
function localFallbackAnalysis(tasks) {
  if (!tasks.length) {
    return {
      metrics: { total_tasks: 0, bottleneck_count: 0, avg_duration_minutes: 0, efficiency_score: 100 },
      bottlenecks: [],
      idle_info: [],
      suggestions: ['Upload workflow data to begin analysis.'],
    };
  }

  const durations = tasks.map(t => t.duration_minutes || 0);
  const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
  const threshold = avg * 1.5;

  const bottleneckTasks = tasks.filter(t => t.duration_minutes > threshold);
  const assigneeCounts = {};
  tasks.forEach(t => { assigneeCounts[t.assigned_to] = (assigneeCounts[t.assigned_to] || 0) + 1; });

  // Idle gaps
  const sorted = [...tasks].sort((a, b) => {
    const toMins = s => { const [h,m] = s.split(':').map(Number); return h*60+m; };
    return toMins(a.start_time) - toMins(b.start_time);
  });

  let totalIdle = 0;
  const idleInfo = [];
  for (let i = 1; i < sorted.length; i++) {
    const toMins = s => { const [h,m] = s.split(':').map(Number); return h*60+m; };
    const gap = toMins(sorted[i].start_time) - toMins(sorted[i-1].end_time);
    if (gap > 0) {
      totalIdle += gap;
      idleInfo.push(`Idle gap of ${gap} minutes between "${sorted[i-1].task_name}" and "${sorted[i].task_name}".`);
    }
  }

  const bottlenecks = bottleneckTasks.map(t => {
    const pct = ((t.duration_minutes - avg) / avg * 100).toFixed(0);
    return `"${t.task_name}" takes ${t.duration_minutes} min — ${pct}% above team average.`;
  });

  const suggestions = [];
  if (bottleneckTasks.length > 0) {
    suggestions.push(`Consider breaking down long tasks: ${bottleneckTasks.map(t => t.task_name).join(', ')}.`);
  }
  Object.entries(assigneeCounts).forEach(([person, count]) => {
    if (count > 1) suggestions.push(`${person} is assigned to ${count} tasks — consider redistributing workload.`);
  });
  if (totalIdle > 0) suggestions.push(`Reduce ${totalIdle} minutes of idle time with better task handoffs.`);

  const efficiencyScore = Math.max(0, Math.round(100 - (bottleneckTasks.length / tasks.length) * 40 - (totalIdle / 300) * 20));

  return {
    metrics: {
      total_tasks: tasks.length,
      bottleneck_count: bottleneckTasks.length,
      avg_duration_minutes: Math.round(avg),
      max_duration_minutes: Math.max(...durations),
      min_duration_minutes: Math.min(...durations),
      total_duration_minutes: durations.reduce((a, b) => a + b, 0),
      total_idle_minutes: totalIdle,
      efficiency_score: efficiencyScore,
    },
    bottlenecks,
    idle_info: idleInfo,
    suggestions,
  };
}

module.exports = { analyzeWorkflow };
