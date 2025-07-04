const { PrismaClient } = require('@prisma/client');
const Prisma = new PrismaClient();

const GetMeController = {
    GetMe: async (req, res) => {
        try {
            const UserId = req.User.UserId;

            if (!UserId) {
                return res.status(401).json({ Error: 'Unauthorized: User ID not found in token payload.' });
            }

            const User = await Prisma.person.findUnique({
                where: { id: UserId },
                select: {
                    id: true,
                    username: true,
                    name: true,
                    phoneNo: true,
                    createdAt: true,
                },
            });

            if (!User) {
                return res.status(404).json({ Error: 'User not found for the provided token.' });
            }

            const UserResponse = {
                Id: User.id,
                Username: User.username,
                Name: User.name,
                PhoneNo: User.phoneNo,
                CreatedAt: User.createdAt,
            };

            res.status(200).json(UserResponse);

        } catch (Error) {
            console.error('Error fetching user data in GetMeController:', Error);
            res.status(500).json({ Error: 'Failed to retrieve user data.', Details: Error.message });
        }
    },
};

module.exports = GetMeController;