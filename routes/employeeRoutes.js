const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController'); 
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware.verifyToken);
router.use(authMiddleware.restrictTo('employee', 'intern'));




console.log(employeeController);

router.post('/:id/attendance', employeeController.submitAttendance);

router.post('/:id/leave-request', employeeController.applyLeave);
router.post('/:id/task-progress', employeeController.submitTaskProgress);
router.post('/:id/progress', employeeController.submitProgressReport);
router.get('/:id/profile', employeeController.getProfile);
router.get('/:id/attendance', employeeController.getAttendanceById);
router.get('/:id/leaves', employeeController.getLeaves);
router.get('/:id/tasks', employeeController.getTasks);
router.get('/:id/progress', employeeController.getProgressReport);

module.exports = router;