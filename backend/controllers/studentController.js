const db = require('../config/db');
const fs = require('fs');
const path = require('path');

// Helper to delete photo file
const deletePhotoFile = (photoPath) => {
  if (photoPath) {
    const fullPath = path.join(__dirname, '..', photoPath);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
        console.log(`Successfully deleted file: ${fullPath}`);
      } catch (err) {
        console.error(`Failed to delete file ${fullPath}:`, err);
      }
    }
  }
};

// GET /students (with pagination, search, filters)
const getStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1');
    const limit = parseInt(req.query.limit || '10');
    const offset = (page - 1) * limit;

    const { search, course, year, gender } = req.query;

    let queryParts = [];
    let queryValues = [];
    let placeholderIndex = 1;

    // Search query (matches name, email, admission_number)
    if (search && search.trim() !== '') {
      queryParts.push(`(name ILIKE $${placeholderIndex} OR email ILIKE $${placeholderIndex} OR admission_number ILIKE $${placeholderIndex})`);
      queryValues.push(`%${search.trim()}%`);
      placeholderIndex++;
    }

    // Filters
    if (course && course.trim() !== '') {
      queryParts.push(`course = $${placeholderIndex}`);
      queryValues.push(course.trim());
      placeholderIndex++;
    }

    if (year) {
      queryParts.push(`year = $${placeholderIndex}`);
      queryValues.push(parseInt(year));
      placeholderIndex++;
    }

    if (gender && gender.trim() !== '') {
      queryParts.push(`gender = $${placeholderIndex}`);
      queryValues.push(gender.trim());
      placeholderIndex++;
    }

    const whereClause = queryParts.length > 0 ? `WHERE ${queryParts.join(' AND ')}` : '';

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) FROM students ${whereClause}`;
    const countResult = await db.query(countQuery, queryValues);
    const totalItems = parseInt(countResult.rows[0].count);

    // Get paginated results
    const dataQuery = `
      SELECT * FROM students 
      ${whereClause} 
      ORDER BY id DESC 
      LIMIT $${placeholderIndex} OFFSET $${placeholderIndex + 1}
    `;
    const dataValues = [...queryValues, limit, offset];
    const { rows: students } = await db.query(dataQuery, dataValues);

    const totalPages = Math.ceil(totalItems / limit);

    return res.status(200).json({
      success: true,
      data: students,
      pagination: {
        total: totalItems,
        page,
        limit,
        pages: totalPages
      }
    });

  } catch (err) {
    console.error('Error fetching students:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve student records',
      error: err.message
    });
  }
};

// GET /students/:id
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query('SELECT * FROM students WHERE id = $1', [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: rows[0]
    });
  } catch (err) {
    console.error('Error fetching student:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve student record',
      error: err.message
    });
  }
};

// POST /students
const createStudent = async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const { name, course, year, dob, email, mobile_number, gender, address } = req.body;
    const photo_path = req.file ? `uploads/${req.file.filename}` : null;

    // Check for email uniqueness before trying to insert to avoid sequencing gaps
    const emailCheck = await client.query('SELECT id FROM students WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      if (req.file) {
        deletePhotoFile(photo_path); // Cleanup uploaded photo since operation will fail
      }
      await client.query('ROLLBACK');
      return res.status(409).json({
        success: false,
        message: 'Email address already registered'
      });
    }

    // Auto-generate Unique Admission Number (ADM-YYYY-XXXXX)
    const currentYear = new Date().getFullYear();
    const prefix = `ADM-${currentYear}-`;
    
    // Acquire a row lock on a dummy or use transactions to avoid race conditions
    const lastStudentQuery = await client.query(
      `SELECT admission_number FROM students 
       WHERE admission_number LIKE $1 
       ORDER BY id DESC LIMIT 1 FOR UPDATE`,
      [`${prefix}%`]
    );

    let nextSeq = 1;
    if (lastStudentQuery.rows.length > 0) {
      const lastAdm = lastStudentQuery.rows[0].admission_number;
      const parts = lastAdm.split('-');
      const lastSeq = parseInt(parts[2]);
      if (!isNaN(lastSeq)) {
        nextSeq = lastSeq + 1;
      }
    }
    
    const admission_number = `${prefix}${String(nextSeq).padStart(5, '0')}`;

    // Insert Student
    const insertQuery = `
      INSERT INTO students (admission_number, name, course, year, dob, email, mobile_number, gender, address, photo_path)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const insertValues = [
      admission_number, name, course, parseInt(year), dob, email, mobile_number, gender, address, photo_path
    ];
    
    const { rows } = await client.query(insertQuery, insertValues);
    const newStudent = rows[0];

    // Log Activity
    await client.query(
      `INSERT INTO activity_logs (action, student_id, description) 
       VALUES ($1, $2, $3)`,
      ['CREATE', newStudent.id, `Student ${name} (${admission_number}) was registered.`]
    );

    await client.query('COMMIT');

    return res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      data: newStudent
    });

  } catch (err) {
    await client.query('ROLLBACK');
    if (req.file) {
      deletePhotoFile(`uploads/${req.file.filename}`);
    }
    console.error('Error creating student:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to register student',
      error: err.message
    });
  } finally {
    client.release();
  }
};

// PUT /students/:id
const updateStudent = async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { name, course, year, dob, email, mobile_number, gender, address } = req.body;

    // Fetch existing student details
    const studentCheck = await client.query('SELECT * FROM students WHERE id = $1 FOR UPDATE', [id]);
    if (studentCheck.rows.length === 0) {
      if (req.file) {
        deletePhotoFile(`uploads/${req.file.filename}`);
      }
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const currentStudent = studentCheck.rows[0];

    // Check email unique constraint (excluding current student)
    const emailCheck = await client.query('SELECT id FROM students WHERE email = $1 AND id != $2', [email, id]);
    if (emailCheck.rows.length > 0) {
      if (req.file) {
        deletePhotoFile(`uploads/${req.file.filename}`);
      }
      await client.query('ROLLBACK');
      return res.status(409).json({
        success: false,
        message: 'Email address already in use by another student'
      });
    }

    let photo_path = currentStudent.photo_path;
    const oldPhotoPath = currentStudent.photo_path;

    if (req.file) {
      photo_path = `uploads/${req.file.filename}`;
    }

    // Update details
    const updateQuery = `
      UPDATE students 
      SET name = $1, course = $2, year = $3, dob = $4, email = $5, mobile_number = $6, gender = $7, address = $8, photo_path = $9, updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *
    `;
    const updateValues = [
      name, course, parseInt(year), dob, email, mobile_number, gender, address, photo_path, id
    ];

    const { rows } = await client.query(updateQuery, updateValues);
    const updatedStudent = rows[0];

    // Delete old photo file if it was replaced
    if (req.file && oldPhotoPath) {
      deletePhotoFile(oldPhotoPath);
    }

    // Log Activity
    await client.query(
      `INSERT INTO activity_logs (action, student_id, description) 
       VALUES ($1, $2, $3)`,
      ['UPDATE', id, `Student details for ${name} (${currentStudent.admission_number}) were updated.`]
    );

    await client.query('COMMIT');

    return res.status(200).json({
      success: true,
      message: 'Student record updated successfully',
      data: updatedStudent
    });

  } catch (err) {
    await client.query('ROLLBACK');
    if (req.file) {
      deletePhotoFile(`uploads/${req.file.filename}`);
    }
    console.error('Error updating student:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update student record',
      error: err.message
    });
  } finally {
    client.release();
  }
};

// DELETE /students/:id
const deleteStudent = async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params;

    // Fetch student to get photo path and details for log
    const studentCheck = await client.query('SELECT name, admission_number, photo_path FROM students WHERE id = $1 FOR UPDATE', [id]);
    if (studentCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const { name, admission_number, photo_path } = studentCheck.rows[0];

    // Delete record from database
    await client.query('DELETE FROM students WHERE id = $1', [id]);

    // Delete photo file if present
    if (photo_path) {
      deletePhotoFile(photo_path);
    }

    // Log Activity (null student_id since the record is deleted)
    await client.query(
      `INSERT INTO activity_logs (action, student_id, description) 
       VALUES ($1, $2, $3)`,
      ['DELETE', null, `Student ${name} (${admission_number}) was dropped from the system.`]
    );

    await client.query('COMMIT');

    return res.status(200).json({
      success: true,
      message: 'Student record deleted successfully'
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error deleting student:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete student record',
      error: err.message
    });
  } finally {
    client.release();
  }
};

// GET /analytics (Dashboard analytics metrics and logs)
const getAnalytics = async (req, res) => {
  try {
    // 1. Total student count
    const totalCountRes = await db.query('SELECT COUNT(*) FROM students');
    const totalStudents = parseInt(totalCountRes.rows[0].count);

    // 2. Course distribution
    const courseDistRes = await db.query('SELECT course, COUNT(*) as count FROM students GROUP BY course ORDER BY count DESC');
    const courseDistribution = courseDistRes.rows.map(r => ({ course: r.course, count: parseInt(r.count) }));

    // 3. Year distribution
    const yearDistRes = await db.query('SELECT year, COUNT(*) as count FROM students GROUP BY year ORDER BY year ASC');
    const yearDistribution = yearDistRes.rows.map(r => ({ year: parseInt(r.year), count: parseInt(r.count) }));

    // 4. Gender distribution
    const genderDistRes = await db.query('SELECT gender, COUNT(*) as count FROM students GROUP BY gender');
    const genderDistribution = genderDistRes.rows.map(r => ({ gender: r.gender, count: parseInt(r.count) }));

    // 5. Recent Activity Logs
    const recentLogsRes = await db.query('SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT 8');
    const activityLogs = recentLogsRes.rows;

    return res.status(200).json({
      success: true,
      data: {
        totalStudents,
        courseDistribution,
        yearDistribution,
        genderDistribution,
        activityLogs
      }
    });

  } catch (err) {
    console.error('Error getting analytics details:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve analytics',
      error: err.message
    });
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getAnalytics
};
