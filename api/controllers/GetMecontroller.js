// File: backend/controllers/GetMeController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const GetMeController = {
    /**
     * Fetches details of the currently authenticated user based on their JWT.
     * This route is protected by AuthMiddleware.
     * @param {object} req - Express request object (with req.user.userId from middleware).
     * @param {object} res - Express response object.
     */
    GetMe: async (req, res) => {
        try {
            // The userId is attached to req.user by the 'protect' middleware after validating the JWT
            const userId = req.user.userId;

            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized: User ID not found in token payload.' });
            }

            // Fetch the user's details from the database
            const user = await prisma.person.findUnique({
                where: { id: userId },
                select: { // Select specific fields to return (exclude password!)
                    id: true,
                    username: true,
                    email: true,
                    name: true,
                    phoneNo: true, // Crucial for the dashboard display
                    createdAt: true,
                },
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found for the provided token.' });
            }

            res.status(200).json(user); // Send back the user's details

        } catch (error) {
            console.error('Error fetching user data in GetMeController:', error);
            res.status(500).json({ error: 'Failed to retrieve user data.', details: error.message });
        }
    },
};

module.exports = GetMeController; // Export the controller object