// File: backend/controllers/GetMeController.js

const { PrismaClient } = require('@prisma/client');
const Prisma = new PrismaClient();

const GetMeController = {
    GetMe: async (Req, Res) => {
        try {
            const UserId = Req.User.UserId;

            if (!UserId) {
                return Res.status(401).json({ Error: 'Unauthorized: User ID not found in token payload.' });
            }

            const User = await Prisma.person.findUnique({
                where: { Id: UserId },
                select: {
                    Id: true,
                    Username: true,
                    Email: true,
                    Name: true,
                    PhoneNo: true,
                    CreatedAt: true,
                },
            });

            if (!User) {
                return Res.status(404).json({ Error: 'User not found for the provided token.' });
            }

            Res.status(200).json(User);

        } catch (Error) {
            console.error('Error fetching user data in GetMeController:', Error);
            Res.status(500).json({ Error: 'Failed to retrieve user data.', Details: Error.Message });
        }
    },
};

module.exports = GetMeController;