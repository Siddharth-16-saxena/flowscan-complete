// ============================================================
// FlowScan — MongoDB Initialization Script
// Run: mongosh flowscan < database/init.js
// ============================================================

use flowscan;

// ── Indexes ──────────────────────────────────────────────────

db.workflows.createIndex({ uploaded_at: -1 });
db.workflows.createIndex({ status: 1 });

db.tasks.createIndex({ workflow_id: 1, sequence_order: 1 });
db.tasks.createIndex({ workflow_id: 1 });
db.tasks.createIndex({ assigned_to: 1 });
db.tasks.createIndex({ is_bottleneck: 1 });

db.analyses.createIndex({ workflow_id: 1 }, { unique: true });
db.analyses.createIndex({ analyzed_at: -1 });

// ── Sample seed data ─────────────────────────────────────────

const workflowId = ObjectId();

db.workflows.insertOne({
  _id: workflowId,
  name: "Sample Software Release",
  original_filename: "sample_workflow.csv",
  file_type: "csv",
  task_count: 4,
  status: "analyzed",
  uploaded_at: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
});

db.tasks.insertMany([
  {
    workflow_id: workflowId,
    task_name: "Design",
    start_time: "10:00",
    end_time: "11:30",
    assigned_to: "Alice",
    duration_minutes: 90,
    is_bottleneck: false,
    has_idle_before: false,
    idle_gap_minutes: 0,
    sequence_order: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    workflow_id: workflowId,
    task_name: "Development",
    start_time: "11:30",
    end_time: "15:00",
    assigned_to: "Bob",
    duration_minutes: 210,
    is_bottleneck: false,
    has_idle_before: false,
    idle_gap_minutes: 0,
    sequence_order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    workflow_id: workflowId,
    task_name: "Testing",
    start_time: "15:30",
    end_time: "18:00",
    assigned_to: "Carol",
    duration_minutes: 150,
    is_bottleneck: true,
    has_idle_before: true,
    idle_gap_minutes: 30,
    sequence_order: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    workflow_id: workflowId,
    task_name: "Fix Bugs",
    start_time: "18:30",
    end_time: "20:00",
    assigned_to: "Bob",
    duration_minutes: 90,
    is_bottleneck: true,
    has_idle_before: true,
    idle_gap_minutes: 30,
    sequence_order: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]);

db.analyses.insertOne({
  workflow_id: workflowId,
  metrics: {
    total_tasks: 4,
    bottleneck_count: 2,
    avg_duration_minutes: 135,
    max_duration_minutes: 210,
    min_duration_minutes: 90,
    total_duration_minutes: 540,
    total_idle_minutes: 60,
    efficiency_score: 67,
  },
  bottlenecks: [
    '"Testing" takes 150 min — 11% above the team average of 135 min.',
    '"Fix Bugs" causes pipeline delay due to repeated assignee Bob.',
  ],
  idle_info: [
    'Idle gap of 30 min detected between "Development" and "Testing".',
    'Idle gap of 30 min detected between "Testing" and "Fix Bugs".',
  ],
  suggestions: [
    '"Bob" handles 2 tasks (Development, Fix Bugs) — consider redistributing to unblock the pipeline.',
    'Automate handoffs to eliminate 60 minutes of cumulative idle time.',
    'Break "Testing" into parallel test suites to reduce duration by ~40%.',
  ],
  analyzed_at: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
});

print("✅ FlowScan database initialized with seed data.");
print(`   Workflow ID: ${workflowId}`);
