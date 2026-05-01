const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');
const prisma = new PrismaClient();

const getTasks = async (req, res, next) => {
  try {
    const { status, priority, assigneeId } = req.query;
    const where = {
      project: { members: { some: { userId: req.user.id } } },
    };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assigneeId) where.assigneeId = assigneeId;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: { select: { id: true, name: true, email: true, avatar: true } },
        creator: { select: { id: true, name: true, email: true, avatar: true } },
        project: { select: { id: true, name: true, color: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(tasks);
  } catch (err) { next(err); }
};

const getProjectTasks = async (req, res, next) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { projectId: req.params.projectId },
      include: {
        assignee: { select: { id: true, name: true, email: true, avatar: true } },
        creator: { select: { id: true, name: true, email: true, avatar: true } },
      },
      orderBy: [{ status: 'asc' }, { priority: 'desc' }, { createdAt: 'desc' }],
    });
    res.json(tasks);
  } catch (err) { next(err); }
};

const createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { title, description, priority, dueDate, assigneeId, projectId } = req.body;

    // Verify assignee is a project member if provided
    if (assigneeId) {
      const isMember = await prisma.projectMember.findUnique({
        where: { userId_projectId: { userId: assigneeId, projectId } },
      });
      if (!isMember) return res.status(400).json({ message: 'Assignee is not a project member' });
    }

    const task = await prisma.task.create({
      data: {
        title, description,
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        assigneeId: assigneeId || null,
        projectId,
        creatorId: req.user.id,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true, avatar: true } },
        creator: { select: { id: true, name: true, email: true, avatar: true } },
        project: { select: { id: true, name: true, color: true } },
      },
    });

    await prisma.activity.create({
      data: {
        action: `created task "${title}"`,
        userId: req.user.id,
        projectId,
        taskId: task.id,
      },
    });

    res.status(201).json(task);
  } catch (err) { next(err); }
};

const updateTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, assigneeId } = req.body;
    const task = req.currentTask;

    const updated = await prisma.task.update({
      where: { id: req.params.taskId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(assigneeId !== undefined && { assigneeId: assigneeId || null }),
      },
      include: {
        assignee: { select: { id: true, name: true, email: true, avatar: true } },
        creator: { select: { id: true, name: true, email: true, avatar: true } },
        project: { select: { id: true, name: true, color: true } },
      },
    });

    // Log status change
    if (status && status !== task.status) {
      await prisma.activity.create({
        data: {
          action: `moved "${updated.title}" to ${status.replace('_', ' ')}`,
          userId: req.user.id,
          projectId: updated.project.id,
          taskId: updated.id,
        },
      });
    }

    res.json(updated);
  } catch (err) { next(err); }
};

const deleteTask = async (req, res, next) => {
  try {
    await prisma.task.delete({ where: { id: req.params.taskId } });
    res.json({ message: 'Task deleted' });
  } catch (err) { next(err); }
};

// Middleware to fetch task and check access
const loadTask = async (req, res, next) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.taskId },
      include: { project: true },
    });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const member = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: req.user.id, projectId: task.projectId } },
    });
    if (!member) return res.status(403).json({ message: 'Access denied' });

    req.currentTask = task;
    req.member = member;
    next();
  } catch (err) { next(err); }
};

module.exports = { getTasks, getProjectTasks, createTask, updateTask, deleteTask, loadTask };
