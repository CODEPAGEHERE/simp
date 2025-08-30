const { PrismaClient } = require('@prisma/client');
const Bcrypt = require('bcryptjs');
const { generateToken } = require('../middleware/TokenUtil');
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
const validator = require('validator');

const Prisma = new PrismaClient();

const LoginController = {
    Login: async (req, res) => {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({ Message: 'Username/Phone number and password are required.' });
        }

        // Validate identifier (username or phone number)
        const phoneNumberRegex = /^\+?\d+$/;
        const usernameRegex = /^[a-zA-Z0-9]{3,20}$/;

        let isValidPhoneNumber = false;
        let isValidUsername = false;

        if (phoneNumberRegex.test(identifier)) {
            try {
                const phoneNumber = phoneUtil.parse(identifier);
                isValidPhoneNumber = phoneUtil.isValidNumber(phoneNumber);
            } catch (error) {
                isValidPhoneNumber = false;
            }
        } else if (usernameRegex.test(identifier)) {
            isValidUsername = true;
        }

        if (!isValidPhoneNumber && !isValidUsername) {
            return res.status(400).json({ Message: 'Invalid username or phone number format.' });
        }

        // Validate password
        if (!validator.isLength(password, { min: 6, max: 20 })) {
            return res.status(400).json({ Message: 'Password should be between 6 and 20 characters.' });
        }

        try {
            let Person = null;

            if (isValidUsername) {
                Person = await Prisma.person.findUnique({
                    where: { username: identifier },
                });
            } else if (isValidPhoneNumber) {
                Person = await Prisma.person.findUnique({
                    where: { phoneNo: identifier },
                });
            }

            if (!Person) {
                return res.status(401).json({ Message: 'Invalid username or password.' });
            }

            const IsPasswordValid = await Bcrypt.compare(password, Person.passwordHash);

            if (!IsPasswordValid) {
                return res.status(401).json({ Message: 'Invalid username or password.' });
            }

            const Payload = {
                UserId: Person.id,
                Username: Person.username,
                RoleId: Person.roleId,
                CategoryId: Person.categoryId,
            };

            const Token = generateToken(Payload);

            res.cookie('Simp_token', Token, {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                maxAge: 3 * 60 * 60 * 1000, // 3 hours
            });

            res.status(200).json({
                Message: 'Login successful!',
            });

        } catch (Error) {
            console.error('Error during person login:', Error);
            res.status(500).json({ Message: 'An unexpected error occurred during login.', Details: Error.message });
        }
    },
};

module.exports = LoginController;
