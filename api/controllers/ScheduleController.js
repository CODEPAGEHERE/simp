const { PrismaClient } = require('@prisma/client');
const Prisma = new PrismaClient();

const durationToSeconds = (Duration) => {
    const hh = parseInt(Duration.hh || 0);
    const mm = parseInt(Duration.mm || 0);
    const ss = parseInt(Duration.ss || 0);
    return (hh * 3600) + (mm * 60) + ss;
};

const ScheduleController = {
    CreateSchedule: async (req, res) => {
        try {
            const UserId = req.user.userId;
            const { mainTask: MainTask, subTasks: SubTasks } = req.body;

            if (!MainTask || !MainTask.name || !MainTask.totalDuration || !UserId) {
                return res.status(400).json({ Error: 'Missing required main task data or user ID.' });
            }

            if (!Array.isArray(SubTasks) || SubTasks.length === 0) {
                return res.status(400).json({ Error: 'At least one sub-task is required.' });
            }

            for (const subTask of SubTasks) {
                const HasValidDurationComponent = !isNaN(parseInt(subTask.duration.hh)) ||
                                                 !isNaN(parseInt(subTask.duration.mm)) ||
                                                 !isNaN(parseInt(subTask.duration.ss));

                if (!subTask.name || !HasValidDurationComponent) {
                    return res.status(400).json({ Error: 'Each sub-task must have a name and a valid duration (HH, MM, or SS).' });
                }
            }

            const TotalDurationSeconds = durationToSeconds(MainTask.totalDuration);

            const SubTasksToCreate = SubTasks.map(subTask => ({
                name: subTask.name,
                durationSeconds: durationToSeconds(subTask.duration),
                status: 'PENDING'
            }));

            const NewSchedule = await Prisma.schedule.create({
                data: {
                    title: MainTask.name,
                    description: MainTask.description || null,
                    totalDurationSeconds: TotalDurationSeconds,
                    status: 'PENDING',
                    person: {
                        connect: { id: UserId }
                    },
                    subTasks: {
                        createMany: {
                            data: SubTasksToCreate,
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

            res.status(201).json(NewSchedule);

        } catch (Error) {
            console.error('Error creating schedule:', Error);
            if (Error.code === 'P2002') {
                res.status(409).json({ Error: 'A schedule with this title already exists.' });
            } else if (Error.code === 'P2025') {
                res.status(404).json({ Error: 'The specified user does not exist or invalid ID.' });
            } else {
                res.status(500).json({ Error: 'Failed to create schedule.', Details: Error.message });
            }
        }
    },

    GetSchedulesForUser: async (req, res) => {
        try {
            const UserId = req.user.userId;

            if (!UserId) {
                return res.status(401).json({ Error: 'Unauthorized: User ID not found in token.' });
            }

            const UserSchedules = await Prisma.schedule.findMany({
                where: {
                    personId: UserId,
                },
                include: {
                    subTasks: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });

            res.status(200).json(UserSchedules);

        } catch (Error) {
            console.error('Error fetching ALL schedules for user:', Error);
            res.status(500).json({ Error: 'Failed to retrieve schedules.', Details: Error.message });
        }
    },

    DeleteSchedule: async (req, res) => {
        try {
            const ScheduleId = req.params.id;
            const UserId = req.user.userId;

            if (!ScheduleId) {
                return res.status(400).json({ Error: 'Schedule ID is required.' });
            }

            const ScheduleToDelete = await Prisma.schedule.findUnique({
                where: { id: ScheduleId },
            });

            if (!ScheduleToDelete) {
                return res.status(404).json({ Error: 'Schedule not found.' });
            }

            if (ScheduleToDelete.personId !== UserId) {
                return res.status(403).json({ Error: 'Unauthorized to delete this schedule.' });
            }

            await Prisma.subTask.deleteMany({
                where: { scheduleId: ScheduleId },
            });

            await Prisma.schedule.delete({
                where: { id: ScheduleId },
            });

            res.status(200).json({ Message: 'Schedule deleted successfully.' });

        } catch (Error) {
            console.error('Error deleting schedule:', Error);
            if (Error.code === 'P2025') {
                res.status(404).json({ Error: 'Schedule not found for deletion.' });
            } else {
                res.status(500).json({ Error: 'Failed to delete schedule.', Details: Error.message });
            }
        }
    },
};

module.exports = ScheduleController;