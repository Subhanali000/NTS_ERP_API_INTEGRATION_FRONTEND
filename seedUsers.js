// seedUsers.js
const bcrypt = require('bcrypt');
const pool = require('./config/database');
const userIds = require('./userIds'); // ✅ Use fixed UUIDs

const users = [
  {
    id: userIds.john,
    employee_id: 'EMP001',
    email: 'john.doe@example.com',
    name: 'John Doe',
    role: 'employee',
    department_id: 1,
    profile_url: '/images/john.png',
    phone: '9876543210',
    address: '123 Main St',
    emergency_contact_name: 'Jane Doe',
    emergency_contact_phone: '9999999999',
    join_date: '2023-01-15',
    salary: 55000.0,
    leave_balance: 18
  },
  {
    id: userIds.emma,
    employee_id: 'EMP002',
    email: 'emma.hr@example.com',
    name: 'Emma HR',
    role: 'global_hr_director',
    department_id: 2,
    profile_url: '/images/emma.png',
    phone: '9876500000',
    address: 'HR Lane, Sector 5',
    emergency_contact_name: 'Alan HR',
    emergency_contact_phone: '9999988888',
    join_date: '2022-07-01',
    salary: 90000.0,
    leave_balance: 25
  },
  {
    id: userIds.steve,
    employee_id: 'EMP003',
    email: 'steve.manager@example.com',
    name: 'Steve Manager',
    role: 'project_tech_manager',
    department_id: 1,
    profile_url: '/images/steve.png',
    phone: '8888888888',
    address: 'Tech Street 42',
    emergency_contact_name: 'Mary Steve',
    emergency_contact_phone: '9999977777',
    join_date: '2022-10-10',
    salary: 75000.0,
    leave_balance: 20
  }
];

const seedUsers = async () => {
  try {
    console.log('🔄 Seeding users...');
    const password = await bcrypt.hash('test1234', 10);

    for (const user of users) {
      await pool.query(
        `INSERT INTO users (
          id, employee_id, email, password_hash, name, role, department_id, 
          profile_url, phone, address, emergency_contact_name, emergency_contact_phone,
          join_date, salary, leave_balance
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, 
          $8, $9, $10, $11, $12, $13, $14, $15
        ) ON CONFLICT (id) DO NOTHING;`,
        [
          user.id,
          user.employee_id,
          user.email,
          password,
          user.name,
          user.role,
          user.department_id,
          user.profile_url,
          user.phone,
          user.address,
          user.emergency_contact_name,
          user.emergency_contact_phone,
          user.join_date,
          user.salary,
          user.leave_balance
        ]
      );
    }

    console.log('✅ Users seeded.');
  } catch (err) {
    console.error('❌ Error seeding users:', err);
  }
};

// Run directly
if (require.main === module) {
  (async () => {
    await seedUsers();
    
  })();
}

module.exports = { seedUsers, userIds };
