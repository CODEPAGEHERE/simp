const { PrismaClient } = require('@prisma/client');
const Prisma = new PrismaClient();

const DashboardController = {
    GetDashboardSchedules: async (req, res) => {
        try {
            const UserId = req.User.UserId;

            if (!UserId) {
                return res.status(401).json({ Error: 'Unauthorized: User ID not found in token.' });
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
                    personId: UserId,
                    startDate: {
                        gte: StartOfToday,
                        lte: EndOfNextSevenDays,
                    },
                },
                orderBy: {
                    startDate: 'asc',
                },
                include: { subTasks: true },
            });

            const Past3DaysSchedules = await Prisma.schedule.findMany({
                where: {
                    personId: UserId,
                    createdAt: {
                        gte: StartOfThreeDaysAgo,
                        lt: StartOfToday,
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
                include: { subTasks: true },
            });

            res.status(200).json({
                Next7Days: Next7DaysSchedules,
                Past3Days: Past3DaysSchedules,
            });

        } catch (Error) {
            console.error('Error fetching dashboard schedules:', Error);
            res.status(500).json({ Error: 'Failed to retrieve dashboard schedules.', Details: Error.Message });
        }
    },
};

module.exports = DashboardController;