
const pool = require('./config/database');
const userIds = require('./userIds'); // not from seedUsers.js
const seedAttendance = async () => {
  try {
    const attendanceRecords = [
      {
        user_id: userIds.john,
        date: '2025-07-01',
        punch_in: '09:00:00',
        punch_out: '17:30:00',
        status: 'present'
      },
      {
        user_id: userIds.john,
        date: '2025-07-02',
        punch_in: '09:15:00',
        punch_out: '17:45:00',
        status: 'present'
      },
      {
        user_id: userIds.emma,
        date: '2025-07-01',
        punch_in: '09:10:00',
        punch_out: '17:40:00',
        status: 'present'
      },
    ];

    for (const record of attendanceRecords) {
      await pool.query(
        `INSERT INTO attendance (user_id, date, punch_in, punch_out, status) 
         VALUES ($1, $2, $3, $4, $5)`,
        [
          record.user_id,
          record.date,
          record.punch_in,
          record.punch_out,
          record.status
        ]
      );
    }

    console.log('✅ Attendance seeded.');
  } catch (err) {
    console.error('❌ Error seeding attendance:', err);
  }
};

// Run directly if executed as script
if (require.main === module) {
  (async () => {
    await seedAttendance();
   
  })();
}

module.exports = { seedAttendance };
