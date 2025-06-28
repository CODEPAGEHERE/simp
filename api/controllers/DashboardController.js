// File: backend/controllers/DashboardController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DashboardController = {
    GetDashboardSchedules: async (req, res) => {
        try {
            const userId = req.user.userId;

            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized: User ID not found in token.' });
            }

            // Calculate date ranges relative to the current time
            const now = new Date();
            const startOfToday = new Date(now);
            startOfToday.setHours(0, 0, 0, 0); // Start of today

            const endOfNextSevenDays = new Date(now);
            endOfNextSevenDays.setDate(now.getDate() + 7);
            endOfNextSevenDays.setHours(23, 59, 59, 999); // End of 7 days from now

            const startOfThreeDaysAgo = new Date(now);
            startOfThreeDaysAgo.setDate(now.getDate() - 3);
            startOfThreeDaysAgo.setHours(0, 0, 0, 0); // Start of 3 days ago

            // Removed 'endOfYesterday' as it was not being utilized in the queries.

            // Fetch schedules starting within the next 7 days (including today)
            const next7DaysSchedules = await prisma.schedule.findMany({
                where: {
                    personId: userId,
                    startDate: { // Assuming 'startDate' is used for future schedules
                        gte: startOfToday,
                        lte: endOfNextSevenDays,
                    },
                },
                orderBy: {
                    startDate: 'asc', // Order by start date ascending
                },
                include: { subTasks: true },
            });

            // Fetch schedules created within the past 3 days (excluding today)
            const past3DaysSchedules = await prisma.schedule.findMany({
                where: {
                    personId: userId,
                    createdAt: { // Assuming 'createdAt' is used for past schedules
                        gte: startOfThreeDaysAgo,
                        lt: startOfToday, // Up to the beginning of today
                    },
                },
                orderBy: {
                    createdAt: 'desc', // Order by creation date descending
                },
                include: { subTasks: true },
            });

            // Respond with both sets of schedules
            res.status(200).json({
                next7Days: next7DaysSchedules,
                past3Days: past3DaysSchedules,
            });

        } catch (error) {
            console.error('Error fetching dashboard schedules:', error);
            res.status(500).json({ error: 'Failed to retrieve dashboard schedules.', details: error.message });
        }
    },
};

module.exports = DashboardController;