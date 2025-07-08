const pool = require('./config/database');
const userIds = require('./userIds'); // not from seedUsers.js

const seedLeaves = async () => {
  try {
    const leaves = [
      {
        user_id: userIds.john,
        leave_type: 'sick',
        start_date: '2025-07-10',
        end_date: '2025-07-12',
        reason: 'Fever and cold',
        manager_approval: 'approved',
        director_approval: 'approved',
      },
    ];

    for (const leave of leaves) {
      await pool.query(
        `INSERT INTO leaves 
         (user_id, leave_type, start_date, end_date, reason, manager_approval, director_approval)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          leave.user_id,
          leave.leave_type,
          leave.start_date,
          leave.end_date,
          leave.reason,
          leave.manager_approval,
          leave.director_approval
        ]
      );
    }

    console.log('✅ Leaves seeded.');
  } catch (err) {
    console.error('❌ Error seeding leaves:', err);
  }
};

// ✅ Export if you want to call from runAll.js
module.exports = { seedLeaves };

// ✅ If this script is run directly: seed and close DB connection
if (require.main === module) {
  (async () => {
    await seedLeaves();
    await pool.end(); // Don't end the pool if called from elsewhere
  })();
}
