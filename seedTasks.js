const pool = require('./config/database');
const userIds = require('./userIds');

const seedTasks = async () => {
  try {
    const tasks = [
      {
        user_id: userIds.john,
        title: 'Finish dashboard UI',
        description: 'Build the remaining frontend pages for HR dashboard',
        progress: 70,
        status: 'in_progress'
      },
      {
        user_id: userIds.john,
        title: 'Fix API integration bug',
        description: 'Resolve JSON parsing error in leave API',
        progress: 100,
        status: 'completed'
      },
    ];

    for (const task of tasks) {
      await pool.query(
        `INSERT INTO tasks (user_id, title, description, progress, status)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          task.user_id,
          task.title,
          task.description,
          task.progress,
          task.status
        ]
      );
    }

    console.log('✅ Tasks seeded.');
  } catch (err) {
    console.error('❌ Error seeding tasks:', err);
  }
};

// ✅ Export the function (do NOT call it directly)
module.exports = { seedTasks };
