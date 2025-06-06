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
 * This function acts as an Express middleware (req, res).
 * It expects 'req.userId' to be populated by authentication middleware.
 */
const createSchedule = async (req, res) => {
    try {
        // Extract the authenticated user's ID from the request object.
        // This 'userId' is typically added by a JWT authentication middleware.
        const userId = req.userId;

        // Destructure main task and sub-tasks data from the request body.
        const { mainTask, subTasks } = req.body;

        // --- Server-Side Validation ---
        // Ensure main task data and user ID are present.
        if (!mainTask || !mainTask.name || !mainTask.totalDuration || !userId) {
            return res.status(400).json({ error: 'Missing required main task data or user ID.' });
        }

        // Ensure there's at least one sub-task and it's an array.
        if (!Array.isArray(subTasks) || subTasks.length === 0) {
            return res.status(400).json({ error: 'At least one sub-task is required.' });
        }

        // Validate each sub-task for name and a valid duration.
        for (const subTask of subTasks) { // Renamed 'st' to 'subTask' for clarity
            const hasValidDurationComponent = !isNaN(parseInt(subTask.duration.hh)) ||
                                             !isNaN(parseInt(subTask.duration.mm)) ||
                                             !isNaN(parseInt(subTask.duration.ss));

            if (!subTask.name || !hasValidDurationComponent) {
                return res.status(400).json({ error: 'Each sub-task must have a name and a valid duration (HH, MM, or SS).' });
            }
        }
        // --- End Validation ---

        // Convert main task's total duration to seconds for storage.
        const totalDurationSeconds = durationToSeconds(mainTask.totalDuration);

        // Prepare sub-task data for creation in the database.
        const subTasksToCreate = subTasks.map(subTask => ({
            name: subTask.name,
            durationSeconds: durationToSeconds(subTask.duration),
            status: 'PENDING' // Default status for new sub-tasks
        }));

        // Use Prisma to create the new schedule record along with its associated sub-tasks.
        const newSchedule = await prisma.schedule.create({
            data: {
                title: mainTask.name,
                description: mainTask.description || null, // Allow description to be optional
                totalDurationSeconds: totalDurationSeconds,
                status: 'PENDING', // Default status for the main schedule
                person: {
                    connect: { id: userId } // Link the schedule to the authenticated Person by their ID
                },
                subTasks: {
                    createMany: { // Use createMany to efficiently create multiple sub-tasks
                        data: subTasksToCreate,
                    },
                },
            },
            // Include related data in the response for immediate client use.
            include: {
                subTasks: true, // Include all newly created sub-tasks
                person: {
                    select: { id: true, username: true, name: true } // Select specific person fields
                }
            },
        });

        // Send a success response with the newly created schedule data.
        res.status(201).json(newSchedule); // 201 Created

    } catch (error) {
        // Log the error for server-side debugging.
        console.error('Error creating schedule:', error);

        // --- Error Handling ---
        // Handle specific Prisma errors for more informative client responses.
        if (error.code === 'P2002') { // Unique constraint violation (e.g., if schedule title must be unique)
            res.status(409).json({ error: 'A schedule with this title already exists.' });
        } else if (error.code === 'P2025') { // Record not found (e.g., if the userId provided doesn't exist)
            res.status(404).json({ error: 'The specified user does not exist or invalid ID.' });
        } else {
            // Generic server error response for unexpected issues.
            res.status(500).json({ error: 'Failed to create schedule.', details: error.message });
        }
    }
};

// Export the 'Schedule' object, containing the 'createSchedule' function.
// This matches how scheduleRoutes.js expects to import it: const { Schedule } = require(...);
module.exports = {
    Schedule: {
        createSchedule,
    },
};