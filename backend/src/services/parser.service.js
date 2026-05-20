const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

/**
 * Parse time string "HH:MM" or ISO to minutes from midnight
 */
function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const s = String(timeStr).trim();
  if (s.includes('T')) {
    const d = new Date(s);
    return d.getHours() * 60 + d.getMinutes();
  }
  const [h, m] = s.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Normalize a single raw task row
 */
function normalizeTask(row, index) {
  const taskName = row.task_name || row['Task Name'] || row.task || row.name || `Task ${index + 1}`;
  const startTime = row.start_time || row['Start Time'] || row.start || '';
  const endTime = row.end_time || row['End Time'] || row.end || '';
  const assignedTo = row.assigned_to || row['Assigned To'] || row.assignee || row.owner || 'Unassigned';

  const startMins = timeToMinutes(startTime);
  const endMins = timeToMinutes(endTime);
  const durationMins = Math.max(0, endMins - startMins);

  return {
    task_name: String(taskName).trim(),
    start_time: String(startTime).trim(),
    end_time: String(endTime).trim(),
    assigned_to: String(assignedTo).trim(),
    duration_minutes: durationMins,
    sequence_order: index,
  };
}

/**
 * Parse a CSV file, returns array of task objects
 */
function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    let index = 0;
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        try {
          results.push(normalizeTask(row, index++));
        } catch (e) {
          console.warn(`Skipping row ${index}: ${e.message}`);
        }
      })
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

/**
 * Parse a JSON file, returns array of task objects
 */
function parseJSON(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error('Invalid JSON format');
  }
  const arr = Array.isArray(data) ? data : data.tasks || data.workflow || Object.values(data);
  if (!Array.isArray(arr)) throw new Error('JSON must contain an array of tasks');
  return arr.map((row, i) => normalizeTask(row, i));
}

/**
 * Parse a workflow file (CSV or JSON)
 */
async function parseWorkflowFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.csv') return parseCSV(filePath);
  if (ext === '.json') return parseJSON(filePath);
  throw new Error(`Unsupported format: ${ext}`);
}

module.exports = { parseWorkflowFile, timeToMinutes };
