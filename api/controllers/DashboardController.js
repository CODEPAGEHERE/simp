// File: backend/controllers/DashboardController.js

const { PrismaClient } = require('@prisma/client');
const Prisma = new PrismaClient();

const DashboardController = {
    GetDashboardSchedules: async (Req, Res) => {
        try {
            const UserId = Req.User.UserId;

            if (!UserId) {
                return Res.status(401).json({ Error: 'Unauthorized: User ID not found in token.' });
            }

            const Now = new Date();
            const StartOfToday = new Date(Now);
            StartOfToday.setHours(0, 0, 0, 0);

            const EndOfNextSevenDays = new Date(Now);
            EndOfNextSevenDays.setDate(Now.getDate() + 7);
            EndOfNextSevenDays.setHours(23, 59, 59, 999);

            const StartOfThreeDaysAgo = new Date(Now);
            StartOfThreeDaysAgo.setDate(Now.getDate() - 3);
            StartOfThreeDaysAgo.setHours(0, 0, 0, 0);

            const Next7DaysSchedules = await Prisma.schedule.findMany({
                where: {
                    PersonId: UserId,
                    StartDate: {
                        gte: StartOfToday,
                        lte: EndOfNextSevenDays,
                    },
                },
                orderBy: {
                    StartDate: 'asc',
                },
                include: { SubTasks: true },
            });

            const Past3DaysSchedules = await Prisma.schedule.findMany({
                where: {
                    PersonId: UserId,
                    CreatedAt: {
                        gte: StartOfThreeDaysAgo,
                        lt: StartOfToday,
                    },
                },
                orderBy: {
                    CreatedAt: 'desc',
                },
                include: { SubTasks: true },
            });

            Res.status(200).json({
                Next7Days: Next7DaysSchedules,
                Past3Days: Past3DaysSchedules,
            });

        } catch (Error) {
            console.error('Error fetching dashboard schedules:', Error);
            Res.status(500).json({ Error: 'Failed to retrieve dashboard schedules.', Details: Error.Message });
        }
    },
};

module.exports = DashboardController;