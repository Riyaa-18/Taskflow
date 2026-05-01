const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');
const prisma = new PrismaClient();

const getProjects = async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      where: { members: { some: { userId: req.user.id } } },
      include: {
        creator: { select: { id: true, name: true, email: true, avatar: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
        },
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(projects);
  } catch (err) { next(err); }
};

const getProject = async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.projectId },
      include: {
        creator: { select: { id: true, name: true, email: true, avatar: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
        },
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, email: true, avatar: true } },
            creator: { select: { id: true, name: true, email: true, avatar: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) { next(err); }
};

const createProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, description, color } = req.body;
    const project = await prisma.project.create({
      data: {
        name, description, color: color || '#6366f1',
        creatorId: req.user.id,
        members: { create: { userId: req.user.id, role: 'ADMIN' } },
      },
      include: {
        creator: { select: { id: true, name: true, email: true, avatar: true } },
        members: { include: { user: { select: { id: true, name: true, email: true, avatar: true } } } },
        _count: { select: { tasks: true } },
      },
    });

    await prisma.activity.create({
      data: { action: `created project "${name}"`, userId: req.user.id, projectId: project.id },
    });

    res.status(201).json(project);
  } catch (err) { next(err); }
};

const updateProject = async (req, res, next) => {
  try {
    const { name, description, color, status } = req.body;
    const project = await prisma.project.update({
      where: { id: req.params.projectId },
      data: { name, description, color, status },
      include: {
        creator: { select: { id: true, name: true, email: true, avatar: true } },
        members: { include: { user: { select: { id: true, name: true, email: true, avatar: true } } } },
        _count: { select: { tasks: true } },
      },
    });
    res.json(project);
  } catch (err) { next(err); }
};

const deleteProject = async (req, res, next) => {
  try {
    await prisma.project.delete({ where: { id: req.params.projectId } });
    res.json({ message: 'Project deleted' });
  } catch (err) { next(err); }
};

const addMember = async (req, res, next) => {
  try {
    const { email, role = 'MEMBER' } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const existing = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: user.id, projectId: req.params.projectId } },
    });
    if (existing) return res.status(400).json({ message: 'User already a member' });

    const member = await prisma.projectMember.create({
      data: { userId: user.id, projectId: req.params.projectId, role },
      include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
    });

    await prisma.activity.create({
      data: {
        action: `added ${user.name} to the project`,
        userId: req.user.id,
        projectId: req.params.projectId,
      },
    });

    res.status(201).json(member);
  } catch (err) { next(err); }
};

const removeMember = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (userId === req.user.id) return res.status(400).json({ message: 'Cannot remove yourself' });

    await prisma.projectMember.delete({
      where: { userId_projectId: { userId, projectId: req.params.projectId } },
    });
    res.json({ message: 'Member removed' });
  } catch (err) { next(err); }
};

const getActivities = async (req, res, next) => {
  try {
    const activities = await prisma.activity.findMany({
      where: { projectId: req.params.projectId },
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    res.json(activities);
  } catch (err) { next(err); }
};

module.exports = { getProjects, getProject, createProject, updateProject, deleteProject, addMember, removeMember, getActivities };
