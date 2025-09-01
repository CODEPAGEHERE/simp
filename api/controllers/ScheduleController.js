const { PrismaClient } = require('@prisma/client');
const Prisma = new PrismaClient();
const validator = require('validator');

const durationToSeconds = (Duration) => {
    const hh = parseInt(Duration.hh || 0);
    const mm = parseInt(Duration.mm || 0);
    const ss = parseInt(Duration.ss || 0);
    return (hh * 3600) + (mm * 60) + ss;
};

const ScheduleController = {
      CreateSchedule: async (req, res) => {
          try {
            if (!req.user || !req.user.UserId) {
              return res.status(401).json({ Error: 'Unauthorized: User not found.' });
            }

            const UserId = req.user.UserId;
            const { mainTask: MainTask, subTasks: SubTasks } = req.body;

            if (!MainTask || !MainTask.name || !MainTask.totalDuration) {
              return res.status(400).json({ Error: 'Missing required main task data.' });
            }

            if (!/^[a-zA-Z0-9\s]{5,30}$/.test(MainTask.name)) {
              return res.status(400).json({ Error: 'Main task name must be between 5 and 30 characters, and can contain letters, numbers, and spaces.' });
            }

            if (!/^\d{1,2}:\d{1,2}:\d{1,2}$/.test(`${String(MainTask.totalDuration.hh).padStart(2, '0')}:${String(MainTask.totalDuration.mm).padStart(2, '0')}:${String(MainTask.totalDuration.ss).padStart(2, '0')}`)) {
              return res.status(400).json({ Error: 'Invalid total duration format. Use HH:MM:SS.' });
            }

            if (!Array.isArray(SubTasks) || SubTasks.length === 0) {
              return res.status(400).json({ Error: 'At least one sub-task is required.' });
            }

            for (const subTask of SubTasks) {
              if (!subTask.name || !/^[a-zA-Z0-9\s]{5,30}$/.test(subTask.name)) {
                return res.status(400).json({ Error: 'Sub-task name must be between 5 and 30 characters, and can contain letters, numbers, and spaces.' });
              }

              if (!/^\d{1,2}:\d{1,2}:\d{1,2}$/.test(`${String(subTask.duration.hh).padStart(2, '0')}:${String(subTask.duration.mm).padStart(2, '0')}:${String(subTask.duration.ss).padStart(2, '0')}`)) {
                return res.status(400).json({ Error: 'Invalid sub-task duration format. Use HH:MM:SS.' });
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

            res.status(201).json({ Message: `Schedule "${NewSchedule.title}" created successfully.` });

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
              const UserId = req.user.UserId;
              const page = parseInt(req.query.page) || 1;
              const limit = 4;

              if (!UserId) {
                return res.status(401).json({ Error: 'Unauthorized: User ID not found in token.' });
              }

              const count = await Prisma.schedule.count({
                where: {
                  personId: UserId,
                },
              });

              const UserSchedules = await Prisma.schedule.findMany({
                where: {
                  personId: UserId,
                },
                include: {
                  subTasks: true,
                  person: {
                    select: { id: true, username: true, name: true }
                  }
                },
                orderBy: {
                  createdAt: 'desc',
                },
                take: limit,
                skip: (page - 1) * limit,
              });

              const totalPages = Math.ceil(count / limit);

              res.status(200).json({
                schedules: UserSchedules,
                pagination: {
                  currentPage: page,
                  totalPages,
                  totalSchedules: count,
                  limit,
                },
              });

            } catch (Error) {
              console.error('Error fetching ALL schedules for user:', Error);
              res.status(500).json({ Error: 'Failed to retrieve schedules.', Details: Error.message });
            }
          },




    DeleteSchedule: async (req, res) => {
        try {
            const ScheduleId = req.params.id;
            const UserId = req.User.UserId;

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
