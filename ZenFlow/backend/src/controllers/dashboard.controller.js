const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    const [
      totalProjects,
      myTasks,
      overdueTasks,
      recentActivities,
      tasksByStatus,
    ] = await Promise.all([
      // Total projects for user
      prisma.project.count({
        where: { members: { some: { userId } } },
      }),

      // My tasks (assigned to me)
      prisma.task.findMany({
        where: { assigneeId: userId },
        include: {
          project: { select: { id: true, name: true, color: true } },
          assignee: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { updatedAt: 'desc' },
        take: 10,
      }),

      // Overdue tasks
      prisma.task.findMany({
        where: {
          assigneeId: userId,
          dueDate: { lt: now },
          status: { notIn: ['DONE'] },
        },
        include: {
          project: { select: { id: true, name: true, color: true } },
        },
        orderBy: { dueDate: 'asc' },
      }),

      // Recent activities
      prisma.activity.findMany({
        where: {
          project: { members: { some: { userId } } },
        },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
          project: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 15,
      }),

      // Tasks by status
      prisma.task.groupBy({
        by: ['status'],
        where: {
          project: { members: { some: { userId } } },
        },
        _count: true,
      }),
    ]);

    const statusMap = tasksByStatus.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {});

    const totalTasks = Object.values(statusMap).reduce((sum, count) => sum + count, 0);

    res.json({
      stats: {
        totalProjects,
        totalTasks,
        myTasksCount: myTasks.length,
        overdueTasks: overdueTasks.length,
        completedTasks: statusMap['DONE'] || 0,
        inProgressTasks: statusMap['IN_PROGRESS'] || 0,
        todoTasks: statusMap['TODO'] || 0,
        reviewTasks: statusMap['REVIEW'] || 0,
      },
      myTasks,
      overdueTasks,
      recentActivities,
    });
  } catch (err) { next(err); }
};

module.exports = { getDashboard };
