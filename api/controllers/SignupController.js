const { PrismaClient } = require('@prisma/client');
const Bcrypt = require('bcryptjs');

const Prisma = new PrismaClient();

const SignupController = {
    Signup: async (req, res) => {
        const { Name, PhoneNo, Username, Password } = req.body;

        const ProcessedName = Name ? Name.trim() : '';
        let ProcessedPhoneNo = PhoneNo;
        const CleanUsername = Username ? Username.toLowerCase().trim() : '';
        const CleanPassword = Password ? Password.trim() : '';

        if (!ProcessedName || !ProcessedPhoneNo || !CleanUsername || !CleanPassword) {
            return res.status(400).json({ Message: 'All fields (name, phone number, username, password) are required.' });
        }

        if (ProcessedName.length < 5 || ProcessedName.length > 50) {
            return res.status(400).json({ Message: 'Your Name must be between 5 and 50 characters long.' });
        }
        if (!/^[a-zA-Z\s]+$/.test(ProcessedName)) {
            return res.status(400).json({ Message: 'Name can only contain alphabets (A-Z, a-z) and spaces.' });
        }

        ProcessedPhoneNo = ProcessedPhoneNo.replace(/[^+\d]/g, '');

        if (ProcessedPhoneNo.startsWith('0')) {
            ProcessedPhoneNo = '+234' + ProcessedPhoneNo.substring(1);
        } else if (!ProcessedPhoneNo.startsWith('+234')) {
            ProcessedPhoneNo = '+234' + ProcessedPhoneNo;
        }

        if ((ProcessedPhoneNo.match(/\+/g) || []).length > 1) {
            return res.status(400).json({ Message: 'Invalid phone number format: "+" can only appear at the beginning.' });
        }

        if (!/^\+234[789]\d{9}$/.test(ProcessedPhoneNo)) {
            return res.status(400).json({ Message: 'Invalid Nigerian phone number format. Must start with +234, 0, or implied +234, followed by 7, 8, or 9 and 9 more digits.' });
        }

        if (!/^[a-z0-9]+$/.test(CleanUsername)) {
            return res.status(400).json({ Message: 'Username can only contain lowercase letters and numbers, no special characters or spaces.' });
        }

        const AllowedPasswordCharsRegex = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]+$/;

        if (CleanPassword.length < 9) {
            return res.status(400).json({ Message: 'Password must be at least 10 characters long.' });
        }
        if (!AllowedPasswordCharsRegex.test(CleanPassword)) {
            return res.status(400).json({
                Message: 'Password can only contain letters, numbers, and common special characters (e.g., !@#$%^&*). No spaces allowed.'
            });
        }

        if (CleanUsername === CleanPassword) {
            return res.status(400).json({ Message: 'Username and password cannot be the same.' });
        }

        try {
            const ExistingPersonByPhoneNo = await Prisma.person.findUnique({
                where: { phoneNo: ProcessedPhoneNo },
            });
            if (ExistingPersonByPhoneNo) {
                return res.status(409).json({ Message: 'A person with this phone number already exists.' });
            }

            const ExistingPersonByUsername = await Prisma.person.findUnique({
                where: { username: CleanUsername },
            });
            if (ExistingPersonByUsername) {
                return res.status(409).json({ Message: 'A person with this username already exists.' });
            }

            const PasswordHash = await Bcrypt.hash(CleanPassword, 10);

            const NewPerson = await Prisma.person.create({
                data: {
                    name: ProcessedName,
                    phoneNo: ProcessedPhoneNo,
                    username: CleanUsername,
                    passwordHash: PasswordHash,
                },
                select: {
                    id: true,
                    name: true,
                    phoneNo: true,
                    username: true,
                    createdAt: true,
                }
            });

            res.status(201).json({
                Message: 'This Person is registered successfully!',
                Person: NewPerson,
            });

        } catch (Error) {
            console.error('Error during person signup:', Error);

            if (Error.code === 'P2002' && Error.meta && Error.meta.target) {
                if (Error.meta.target.includes('phoneNo')) {
                    return res.status(409).json({ Message: 'A person with this phone number already exists.' });
                }
                if (Error.meta.target.includes('username')) {
                    return res.status(409).json({ Message: 'A person with this username already exists.' });
                }
                return res.status(409).json({ Message: 'A person with conflicting unique data already exists.' });
            }

            res.status(500).json({ Message: 'An unexpected error occurred during registration.' });
        }
    },
};

module.exports = SignupController;