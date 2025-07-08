const { seedUsers } = require('./seedUsers');
const { seedLeaves } = require('./seedLeaves');
const { seedTasks } = require('./seedTasks');
const { seedAttendance } = require('./seedAttendance');
const pool = require('./config/database');

const runAll = async () => {
  try {
    await seedUsers();
    await seedLeaves();
    await seedTasks();
    await seedAttendance();
    console.log('✅ All data seeded successfully.');
  } catch (err) {
    console.error('❌ Error running seeders:', err);
  } finally {
    await pool.end(); // Close DB connection once at the end
  }
};

runAll();
