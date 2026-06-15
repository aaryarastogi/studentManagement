const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'aaryarastogi',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'student_management',
});

pool.on('connect', () => {
  console.log('Connected to the PostgreSQL database successfully.');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
});

// Seed data helper
const seedStudents = [
  {
    admission_number: 'ADM-2026-00001',
    name: 'Aarav Sharma',
    course: 'Computer Science & Engineering',
    year: 3,
    dob: '2005-04-12',
    email: 'aarav.sharma@example.com',
    mobile_number: '9876543210',
    gender: 'Male',
    address: '102, Green Park Avenue, New Delhi, Delhi - 110016',
    photo_path: null
  },
  {
    admission_number: 'ADM-2026-00002',
    name: 'Ananya Iyer',
    course: 'Electronics & Communication',
    year: 2,
    dob: '2006-08-25',
    email: 'ananya.iyer@example.com',
    mobile_number: '8765432109',
    gender: 'Female',
    address: '45, Lake View Road, Indiranagar, Bengaluru, Karnataka - 560038',
    photo_path: null
  },
  {
    admission_number: 'ADM-2026-00003',
    name: 'Kabir Mehta',
    course: 'Computer Science & Engineering',
    year: 4,
    dob: '2004-11-03',
    email: 'kabir.mehta@example.com',
    mobile_number: '7654321098',
    gender: 'Male',
    address: 'A-304, Royal Crest, Bandra West, Mumbai, Maharashtra - 400050',
    photo_path: null
  },
  {
    admission_number: 'ADM-2026-00004',
    name: 'Diya Sen',
    course: 'Mechanical Engineering',
    year: 1,
    dob: '2007-02-14',
    email: 'diya.sen@example.com',
    mobile_number: '6543210987',
    gender: 'Female',
    address: '12/1, Salt Lake Sector 3, Kolkata, West Bengal - 700097',
    photo_path: null
  },
  {
    admission_number: 'ADM-2026-00005',
    name: 'Rohan Deshmukh',
    course: 'Information Technology',
    year: 3,
    dob: '2005-09-18',
    email: 'rohan.deshmukh@example.com',
    mobile_number: '9988776655',
    gender: 'Male',
    address: '77, Shivaji Nagar, Pune, Maharashtra - 411005',
    photo_path: null
  }
];

const initDb = async () => {
  const client = await pool.connect();
  try {
    console.log('Initializing database schema...');
    
    // Create Students Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        admission_number VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        course VARCHAR(100) NOT NULL,
        year INTEGER NOT NULL,
        dob DATE NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        mobile_number VARCHAR(20) NOT NULL,
        gender VARCHAR(15) NOT NULL,
        address TEXT NOT NULL,
        photo_path VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Activity Logs Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        action VARCHAR(50) NOT NULL,
        student_id INTEGER,
        description TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_students_name ON students(name);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_students_course ON students(course);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_students_year ON students(year);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp DESC);
    `);

    console.log('Database tables and indexes verified/created successfully.');

    // Seed database if empty
    const { rows } = await client.query('SELECT COUNT(*) FROM students');
    const studentCount = parseInt(rows[0].count);
    
    if (studentCount === 0) {
      console.log('Database is empty. Seeding initial student records...');
      for (const student of seedStudents) {
        await client.query(
          `INSERT INTO students (admission_number, name, course, year, dob, email, mobile_number, gender, address, photo_path)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            student.admission_number,
            student.name,
            student.course,
            student.year,
            student.dob,
            student.email,
            student.mobile_number,
            student.gender,
            student.address,
            student.photo_path
          ]
        );
      }
      
      // Log seeding activity
      await client.query(
        `INSERT INTO activity_logs (action, description) VALUES ($1, $2)`,
        ['SEED', 'Seed initial set of 5 students into the database.']
      );
      
      console.log('Seeding completed successfully.');
    } else {
      console.log(`Database already has ${studentCount} records. Skipping seeding.`);
    }

  } catch (err) {
    console.error('Database initialization failed:', err);
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  initDb,
};
