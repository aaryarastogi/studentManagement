const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const upload = require('../middleware/upload');
const { studentValidationRules, validate } = require('../middleware/validation');

// GET /students/analytics (Fetch dashboard statistics and recent activity logs)
// Note: Put this route before /:id to prevent matching 'analytics' as an ID
router.get('/analytics', studentController.getAnalytics);

// GET /students (Fetch paginated, filtered, and searched student list)
router.get('/', studentController.getStudents);

// GET /students/:id (Fetch detailed information of a single student)
router.get('/:id', studentController.getStudentById);

// POST /students (Register new student with optional photo upload and form validations)
router.post('/', upload.single('photo'), studentValidationRules(), validate, studentController.createStudent);

// PUT /students/:id (Update student information with optional photo update and validations)
router.put('/:id', upload.single('photo'), studentValidationRules(), validate, studentController.updateStudent);

// DELETE /students/:id (Drop/delete a student record from the system)
router.delete('/:id', studentController.deleteStudent);

module.exports = router;
