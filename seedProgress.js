const pool = require('./config/database');
const userIds = require('./userIds'); // ✅ Correct: Use static UUIDs from shared file

const seedProgress = async () => {
  try {
    const progressEntries = [
      {
        user_id: userIds.john,
        date: '2025-07-01',
        accomplishments: 'Completed frontend integration for profile page and added new leave types.',
        daily_progress: 80
      },
      {
        user_id: userIds.john,
        date: '2025-07-02',
        accomplishments: 'Fixed layout issues and deployed to staging.',
        daily_progress: 100
      },
      {
        user_id: userIds.emma,
        date: '2025-07-01',
        accomplishments: 'Held team meeting and finalized recruitment strategy.',
        daily_progress: 85
      }
    ];

    for (const entry of progressEntries) {
      await pool.query(
        `INSERT INTO progress (user_id, date, accomplishments, daily_progress)
         VALUES ($1, $2, $3, $4)`,
        [
          entry.user_id,
          entry.date,
          entry.accomplishments,
          entry.daily_progress
        ]
      );
    }

    console.log('✅ Progress seeded.');
  } catch (err) {
    console.error('❌ Error seeding progress:', err);
  }
};

// ✅ Run if this file is executed directly
if (require.main === module) {
  (async () => {
    await seedProgress();
    
  })();
}

module.exports = seedProgress;
