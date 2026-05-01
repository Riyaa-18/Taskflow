const router = require('express').Router();
const { body } = require('express-validator');
const { authenticate, requireProjectAdmin, requireProjectMember } = require('../middleware/auth.middleware');
const {
  getProjects, getProject, createProject, updateProject,
  deleteProject, addMember, removeMember, getActivities,
} = require('../controllers/project.controller');

router.use(authenticate);

router.get('/', getProjects);
router.post('/', [
  body('name').trim().notEmpty().withMessage('Project name required'),
], createProject);

router.get('/:projectId', requireProjectMember, getProject);
router.put('/:projectId', requireProjectAdmin, updateProject);
router.delete('/:projectId', requireProjectAdmin, deleteProject);

router.post('/:projectId/members', requireProjectAdmin, addMember);
router.delete('/:projectId/members/:userId', requireProjectAdmin, removeMember);

router.get('/:projectId/activities', requireProjectMember, getActivities);

module.exports = router;
