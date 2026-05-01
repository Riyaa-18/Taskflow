const router = require('express').Router();
const { body } = require('express-validator');
const { authenticate, requireProjectMember } = require('../middleware/auth.middleware');
const { getTasks, getProjectTasks, createTask, updateTask, deleteTask, loadTask } = require('../controllers/task.controller');

router.use(authenticate);

// All tasks for current user
router.get('/', getTasks);

// Tasks in a project
router.get('/project/:projectId', requireProjectMember, getProjectTasks);

// Create task
router.post('/', [
  body('title').trim().notEmpty().withMessage('Task title required'),
  body('projectId').notEmpty().withMessage('Project ID required'),
], createTask);

// Task-specific routes
router.put('/:taskId', loadTask, updateTask);
router.delete('/:taskId', loadTask, deleteTask);

module.exports = router;
