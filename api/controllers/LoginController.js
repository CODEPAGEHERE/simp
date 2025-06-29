const { PrismaClient } = require('@prisma/client');
const Bcrypt = require('bcryptjs');
const Jwt = require('jsonwebtoken');

const Prisma = new PrismaClient();

const LoginController = {
    Login: async (req, res) => {
        const { Identifier, Password } = req.body;

        if (!Identifier || !Password) {
            return res.status(400).json({ Message: 'Username/Phone number and password are required.' });
        }

        try {
            let Person = null;

            const CleanIdentifier = Identifier.toLowerCase().trim();
            Person = await Prisma.person.findUnique({
                where: { username: CleanIdentifier },
            });

            if (!Person) {
                let ProcessedPhoneNo = Identifier;

                ProcessedPhoneNo = ProcessedPhoneNo.replace(/[^+\d]/g, '');

                if (ProcessedPhoneNo.startsWith('0')) {
                    ProcessedPhoneNo = '+234' + ProcessedPhoneNo.substring(1);
                } else if (!ProcessedPhoneNo.startsWith('+234')) {
                    ProcessedPhoneNo = '+234' + ProcessedPhoneNo;
                }

                if (/^\+234[789]\d{9}$/.test(ProcessedPhoneNo)) {
                    Person = await Prisma.person.findUnique({
                        where: { phoneNo: ProcessedPhoneNo },
                    });
                }
            }

            if (!Person) {
                return res.status(401).json({ Message: 'Invalid username or password.' });
            }

            const IsPasswordValid = await Bcrypt.compare(Password, Person.passwordHash);

            if (!IsPasswordValid) {
                return res.status(401).json({ Message: 'Invalid username or password.' });
            }

            const TokenPayload = {
                UserId: Person.id,
                Username: Person.username,
            };

            const Token = Jwt.sign(TokenPayload, process.env.JWT_SECRET, {
                expiresIn: '1h',
            });

            const PersonResponse = {
                Id: Person.id,
                Name: Person.name,
                Username: Person.username,
                PhoneNo: Person.phoneNo,
                Email: Person.email,
                CreatedAt: Person.createdAt,
            };

            res.status(200).json({
                Message: 'Login successful!',
                Token: Token,
                Person: PersonResponse,
            });

        } catch (Error) {
            console.error('Error during person login:', Error);
            res.status(500).json({ Message: 'An unexpected error occurred during login.', Details: Error.message });
        }
    },
};

module.exports = LoginController;