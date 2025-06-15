// This file would likely be something like `backend/controllers/scheduleController.js`
// (Or whatever you've named the file containing createSchedule)

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Helper function to convert a duration object (e.g., { hh: '01', mm: '30', ss: '00' })
 * into its total equivalent in seconds.
 * @param {object} duration - An object containing hour (hh), minute (mm), and second (ss) components.
 * @returns {number} The total duration in seconds.
 */
const durationToSeconds = (duration) => {
    // Safely parse integers, defaulting to 0 if null, undefined, or invalid.
    const hh = parseInt(duration.hh || 0);
    const mm = parseInt(duration.mm || 0);
    const ss = parseInt(duration.ss || 0);
    return (hh * 3600) + (mm * 60) + ss;
};


/**
 * Controller function to handle the creation of a new schedule.
 * (Your existing code)
 */
const createSchedule = async (req, res) => {
    try {
        const userId = req.userId;
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
};


/**
 * Controller function to handle fetching all schedules for the authenticated user.
 * This function acts as an Express middleware (req, res).
 * It expects 'req.userId' to be populated by authentication middleware.
 */
const getSchedulesForUser = async (req, res) => {
    try {
        const userId = req.userId; // Get the user ID from the authentication middleware

        if (!userId) {
            // This case should ideally be caught by the authentication middleware
            // but is a good safety check.
            return res.status(401).json({ error: 'Unauthorized: User ID not found.' });
        }

        // Use Prisma to find all schedules where the 'personId' matches the authenticated userId.
        // Include the related 'subTasks' for each schedule.
        const userSchedules = await prisma.schedule.findMany({
            where: {
                personId: userId,
            },
            include: {
                subTasks: true, // Include the associated sub-tasks
            },
            // Order by creation date or last used date, if applicable, for a consistent list
            orderBy: {
                createdAt: 'desc', // Most recent schedules first
            },
        });

        // If no schedules are found, return an empty array (or a specific message)
        if (!userSchedules || userSchedules.length === 0) {
            return res.status(200).json([]); // Return an empty array
            // Alternatively, you could send a message:
            // return res.status(200).json({ message: 'No schedules found for this user.', schedules: [] });
        }

        // Return the fetched schedules as a JSON array.
        res.status(200).json(userSchedules);

    } catch (error) {
        console.error('Error fetching schedules for user:', error);
        // Handle specific Prisma errors or general server errors.
        res.status(500).json({ error: 'Failed to retrieve schedules.', details: error.message });
    }
};


// Add the delete schedule functionality as well, since your frontend expects it
const deleteSchedule = async (req, res) => {
    try {
        const scheduleId = req.params.id; // Get schedule ID from URL parameters
        const userId = req.userId; // Get user ID from authentication middleware

        // Validate scheduleId
        if (!scheduleId) {
            return res.status(400).json({ error: 'Schedule ID is required.' });
        }

        // Find the schedule and verify it belongs to the authenticated user
        const scheduleToDelete = await prisma.schedule.findUnique({
            where: {
                id: scheduleId,
            },
        });

        if (!scheduleToDelete) {
            return res.status(404).json({ error: 'Schedule not found.' });
        }

        if (scheduleToDelete.personId !== userId) {
            return res.status(403).json({ error: 'Unauthorized to delete this schedule.' });
        }

        // Delete associated subTasks first (if your Prisma schema uses onDelete: Cascade, this might not be strictly necessary, but it's safer)
        await prisma.subTask.deleteMany({
            where: {
                scheduleId: scheduleId,
            },
        });

        // Then delete the schedule itself
        await prisma.schedule.delete({
            where: {
                id: scheduleId,
            },
        });

        res.status(200).json({ message: 'Schedule deleted successfully.' });

    } catch (error) {
        console.error('Error deleting schedule:', error);
        if (error.code === 'P2025') { // Record to delete does not exist
            res.status(404).json({ error: 'Schedule not found for deletion.' });
        } else {
            res.status(500).json({ error: 'Failed to delete schedule.', details: error.message });
        }
    }
};



// Export both functions (createSchedule and getSchedulesForUser)
// This matches how your routes file expects to import them.
module.exports = {
    Schedule: {
        createSchedule,
        getSchedulesForUser, // <--- Add this new function to the export
		 deleteSchedule,  
    },
};