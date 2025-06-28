// This file: backend/controllers/ScheduleController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const durationToSeconds = (duration) => {
    const hh = parseInt(duration.hh || 0);
    const mm = parseInt(duration.mm || 0);
    const ss = parseInt(duration.ss || 0);
    return (hh * 3600) + (mm * 60) + ss;
};

const ScheduleController = {
    CreateSchedule: async (req, res) => { // PascalCase for exported function
        try {
            const userId = req.user.userId;
            const { mainTask, subTasks } = req.body;

            if (!mainTask || !mainTask.name || !mainTask.totalDuration || !userId) {
                return res.status(400).json({ error: 'Missing required main task data or user ID.' });
            }

            if (!Array.isArray(subTasks) || subTasks.length === 0) {
                return res.status(400).json({ error: 'At least one sub-task is required.' });
            }

            for (const subTask of subTasks) {
                const hasValidDurationComponent = !isNaN(parseInt(subTask.duration.hh)) ||
                                                 !isNaN(parseInt(subTask.duration.mm)) ||
                                                 !isNaN(parseInt(subTask.duration.ss));

                if (!subTask.name || !hasValidDurationComponent) {
                    return res.status(400).json({ error: 'Each sub-task must have a name and a valid duration (HH, MM, or SS).' });
                }
            }

            const totalDurationSeconds = durationToSeconds(mainTask.totalDuration);

            const subTasksToCreate = subTasks.map(subTask => ({
                name: subTask.name,
                durationSeconds: durationToSeconds(subTask.duration),
                status: 'PENDING'
            }));

            const newSchedule = await prisma.schedule.create({
                data: {
                    title: mainTask.name,
                    description: mainTask.description || null,
                    totalDurationSeconds: totalDurationSeconds,
                    status: 'PENDING',
                    person: {
                        connect: { id: userId }
                    },
                    subTasks: {
                        createMany: {
                            data: subTasksToCreate,
                        },
                    },
                },
                include: {
                    subTasks: true,
                    person: {
                        select: { id: true, username: true, name: true }
                    }
                },
            });

            res.status(201).json(newSchedule);

        } catch (error) {
            console.error('Error creating schedule:', error);
            if (error.code === 'P2002') {
                res.status(409).json({ error: 'A schedule with this title already exists.' });
            } else if (error.code === 'P2025') {
                res.status(404).json({ error: 'The specified user does not exist or invalid ID.' });
            } else {
                res.status(500).json({ error: 'Failed to create schedule.', details: error.message });
            }
        }
    },

    GetSchedulesForUser: async (req, res) => { // PascalCase for exported function
        try {
            const userId = req.user.userId;

            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized: User ID not found in token.' });
            }

            const userSchedules = await prisma.schedule.findMany({
                where: {
                    personId: userId,
                },
                include: {
                    subTasks: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });

            res.status(200).json(userSchedules);

        } catch (error) {
            console.error('Error fetching ALL schedules for user:', error);
            res.status(500).json({ error: 'Failed to retrieve schedules.', details: error.message });
        }
    },

    DeleteSchedule: async (req, res) => { // PascalCase for exported function
        try {
            const scheduleId = req.params.id;
            const userId = req.user.userId;

            if (!scheduleId) {
                return res.status(400).json({ error: 'Schedule ID is required.' });
            }

            const scheduleToDelete = await prisma.schedule.findUnique({
                where: { id: scheduleId },
            });

            if (!scheduleToDelete) {
                return res.status(404).json({ error: 'Schedule not found.' });
            }

            if (scheduleToDelete.personId !== userId) {
                return res.status(403).json({ error: 'Unauthorized to delete this schedule.' });
            }

            await prisma.subTask.deleteMany({
                where: { scheduleId: scheduleId },
            });

            await prisma.schedule.delete({
                where: { id: scheduleId },
            });

            res.status(200).json({ message: 'Schedule deleted successfully.' });

        } catch (error) {
            console.error('Error deleting schedule:', error);
            if (error.code === 'P2025') {
                res.status(404).json({ error: 'Schedule not found for deletion.' });
            } else {
                res.status(500).json({ error: 'Failed to delete schedule.', details: error.message });
            }
        }
    },
};

module.exports = ScheduleController; // Export the PascalCase object