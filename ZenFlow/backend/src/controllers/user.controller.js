const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json([]);

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
        NOT: { id: req.user.id },
      },
      select: { id: true, name: true, email: true, avatar: true },
      take: 10,
    });
    res.json(users);
  } catch (err) { next(err); }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, avatar },
      select: { id: true, name: true, email: true, avatar: true },
    });
    res.json(user);
  } catch (err) { next(err); }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(400).json({ message: 'Current password is wrong' });

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });
    res.json({ message: 'Password updated' });
  } catch (err) { next(err); }
};
const deleteAccount = async (req, res, next) => {
  try {
    await prisma.user.delete({ where: { id: req.user.id } });
    res.json({ message: 'Account deleted successfully' });
  } catch (err) { next(err); }
};
const getTeamMembers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, name: true, email: true, avatar: true, role: true,
        assignedTasks: {
          select: { id: true, status: true, dueDate: true }
        }
      }
    })

    const members = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      stats: {
        done: user.assignedTasks.filter(t => t.status === 'DONE').length,
        inProgress: user.assignedTasks.filter(t => t.status === 'IN_PROGRESS').length,
        overdue: user.assignedTasks.filter(t => 
          t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE'
        ).length,
      }
    }))

    res.json(members)
  } catch (err) { next(err) }
}

module.exports = { searchUsers, updateProfile, changePassword, deleteAccount, getTeamMembers };
