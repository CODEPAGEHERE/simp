const { PrismaClient } = require('@prisma/client');
const Bcrypt = require('bcryptjs');
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
const validator = require('validator');

const Prisma = new PrismaClient();

const SignupController = {
    Signup: async (req, res) => {
        const { Name, Category, PhoneNo, Email, Username, Password } = req.body;

        if (!Name || !PhoneNo || !Email || !Username || !Password || !Category) {
            return res.status(400).json({ Message: 'Please fill in all fields.' });
        }

        if (!/^[a-zA-Z\s]{5,}$/.test(Name)) {
            return res.status(400).json({ Message: 'Full name must be at least 5 characters long and contain only alphabets and spaces.' });
        }

        const ProcessedName = Name.toLowerCase().trim();
        const ProcessedUsername = Username.trim().toLowerCase();
        const ProcessedEmail = Email.trim().toLowerCase();

        try {
            const phoneNumber = phoneUtil.parse(PhoneNo);
            if (!phoneUtil.isValidNumber(phoneNumber)) {
                return res.status(400).json({ Message: 'Invalid phone number. Please enter a valid phone number.' });
            }
        } catch (Error) {
            return res.status(400).json({ Message: 'Invalid phone number. Please enter a valid phone number.' });
        }

        if (!validator.isEmail(ProcessedEmail)) {
            return res.status(400).json({ Message: 'Invalid email address.' });
        }

        if (!/^[a-zA-Z0-9]{5,}$/.test(ProcessedUsername) || !validator.isAlphanumeric(ProcessedUsername)) {
            return res.status(400).json({ Message: 'Username must be at least 5 characters long and contain only alphabets and numbers.' });
        }

        if (ProcessedUsername === Password.toLowerCase()) {
            return res.status(400).json({ Message: 'Username and password cannot be the same.' });
        }

        if (Password.length < 6 || Password.length > 20 || Password.includes(' ')) {
            return res.status(400).json({ Message: 'Password must be between 6 and 20 characters long and contain no spaces.' });
        }

        const CategoryData = await Prisma.category.findUnique({
            where: { name: Category },
        });

        if (!CategoryData) {
            return res.status(400).json({ Message: 'Invalid category.' });
        }

        const CategoryId = CategoryData.id;

        const Role = await Prisma.role.findUnique({
            where: { name: 'scheduler' },
        });

        if (!Role) {
            return res.status(500).json({ Message: 'Scheduler role not found.' });
        }

        const RoleId = Role.id;

        try {
            const ExistingPersonByPhoneNo = await Prisma.person.findUnique({
                where: { phoneNo: PhoneNo },
            });
            if (ExistingPersonByPhoneNo) {
                return res.status(409).json({ Message: 'A person with this phone number already exists.' });
            }

            const ExistingPersonByUsername = await Prisma.person.findUnique({
                where: { username: ProcessedUsername },
            });
            if (ExistingPersonByUsername) {
                return res.status(409).json({ Message: 'A person with this username already exists.' });
            }

            const ExistingPersonByEmail = await Prisma.person.findUnique({
                where: { email: ProcessedEmail },
            });
            if (ExistingPersonByEmail) {
                return res.status(409).json({ Message: 'A person with this email already exists.' });
            }

            const PasswordHash = await Bcrypt.hash(Password, 10);

            const NewPerson = await Prisma.person.create({
                data: {
                    name: ProcessedName,
                    categoryId: CategoryId,
                    phoneNo: PhoneNo,
                    email: ProcessedEmail,
                    username: ProcessedUsername,
                    passwordHash: PasswordHash,
                    roleId: RoleId,
                },
                select: {
                    id: true,
                    name: true,
                    categoryId: true,
                    phoneNo: true,
                    email: true,
                    username: true,
                    roleId: true,
                    createdAt: true,
                }
            });

            res.status(201).json({
                      Message: 'This Person is registered successfully!',
                      Person: {
                          username: NewPerson.username,
                          email: NewPerson.email,
                          name: NewPerson.name,
                          },
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
                if (Error.meta.target.includes('email')) {
                    return res.status(409).json({ Message: 'A person with this email already exists.' });
                }
                return res.status(409).json({ Message: 'A person with the same  data already exists.' });
            }

            res.status(500).json({ Message: 'An unexpected error occurred during registration.' });
        }
    },
};

module.exports = SignupController;
