const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, avatar: true, role: true },
    });

    if (!user) return res.status(401).json({ message: 'User not found' });

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Check if user is Admin of a project
const requireProjectAdmin = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.body.projectId;
    const member = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: req.user.id, projectId } },
    });

    if (!member || member.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    req.member = member;
    next();
  } catch (err) {
    next(err);
  }
};

// Check if user is member of a project
const requireProjectMember = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.body.projectId;
    const member = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: req.user.id, projectId } },
    });

    if (!member) {
      return res.status(403).json({ message: 'Project access required' });
    }
    req.member = member;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { authenticate, requireProjectAdmin, requireProjectMember };
