const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const signup = async (req, res) => {
    const { name, phoneNo, username, password } = req.body;

    // 1. Initial Data Cleaning & Preparation
    const processedName = name ? name.trim() : '';
    let processedPhoneNo = phoneNo;
    const cleanUsername = username ? username.toLowerCase().trim() : '';
    const cleanPassword = password ? password.trim() : '';

    // 2. Comprehensive Input Validation
    if (!processedName || !processedPhoneNo || !cleanUsername || !cleanPassword) {
        return res.status(400).json({ message: 'All fields (name, phone number, username, password) are required.' });
    }

    // Name Validation
    if (processedName.length < 5 || processedName.length > 50) {
        return res.status(400).json({ message: 'Your Name must be between 5 and 50 characters long.' });
    }
    if (!/^[a-zA-Z\s]+$/.test(processedName)) {
        return res.status(400).json({ message: 'Name can only contain alphabets (A-Z, a-z) and spaces.' });
    }

    // Phone Number Validation & Normalization
    processedPhoneNo = processedPhoneNo.replace(/[^+\d]/g, ''); // Remove all non-digits except leading '+'

    if (processedPhoneNo.startsWith('0')) {
        processedPhoneNo = '+234' + processedPhoneNo.substring(1); // Convert '0' prefix to '+234'
    } else if (!processedPhoneNo.startsWith('+234')) {
        processedPhoneNo = '+234' + processedPhoneNo; // Add '+234' if not present
    }

    if ((processedPhoneNo.match(/\+/g) || []).length > 1) { // Ensure '+' only at the beginning
        return res.status(400).json({ message: 'Invalid phone number format: "+" can only appear at the beginning.' });
    }

    // Final Nigerian phone number format check
    if (!/^\+234[789]\d{9}$/.test(processedPhoneNo)) {
        return res.status(400).json({ message: 'Invalid Nigerian phone number format. Must start with +234, 0, or implied +234, followed by 7, 8, or 9 and 9 more digits.' });
    }

    // Username Validation
    if (!/^[a-z0-9]+$/.test(cleanUsername)) {
        return res.status(400).json({ message: 'Username can only contain lowercase letters and numbers, no special characters or spaces.' });
    }

    // Password Validation
    if (cleanPassword.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }
    if (!/^[a-zA-Z0-9]+$/.test(cleanPassword)) {
        return res.status(400).json({ message: 'Password can only contain letters and numbers, no special characters or spaces allowed.' });
    }

    // Prevent username and password from being identical
    if (cleanUsername === cleanPassword) {
        return res.status(400).json({ message: 'Username and password cannot be the same.' });
    }

    try {
        // 3. Check for existing person based on unique fields (`phoneNo` and `username`)
        const existingPersonByPhoneNo = await prisma.person.findUnique({
            where: { phoneNo: processedPhoneNo },
        });
        if (existingPersonByPhoneNo) {
            return res.status(409).json({ message: 'A person with this phone number already exists.' });
        }

        const existingPersonByUsername = await prisma.person.findUnique({
            where: { username: cleanUsername },
        });
        if (existingPersonByUsername) {
            return res.status(409).json({ message: 'A person with this username already exists.' });
        }

        // 4. Hash the password
        const passwordHash = await bcrypt.hash(cleanPassword, 10);

        // 5. Create the new Person in the database
        const newPerson = await prisma.person.create({
            data: {
                name: processedName,
                phoneNo: processedPhoneNo,
                username: cleanUsername,
                passwordHash,
            },
            select: {
                id: true,
                name: true,
                phoneNo: true,
                username: true,
                createdAt: true,
            }
        });

        // 6. Respond with success
        res.status(201).json({
            message: 'This Person is registered successfully!',
            person: newPerson,
        });

    } catch (error) {
        console.error('Error during person signup:', error);

        // Prisma unique constraint error handling
        if (error.code === 'P2002' && error.meta && error.meta.target) {
            if (error.meta.target.includes('phoneNo')) {
                return res.status(409).json({ message: 'A person with this phone number already exists.' });
            }
            if (error.meta.target.includes('username')) {
                return res.status(409).json({ message: 'A person with this username already exists.' });
            }
            return res.status(409).json({ message: 'A person with conflicting unique data already exists.' });
        }

        // Catch any other unexpected errors
        res.status(500).json({ message: 'An unexpected error occurred during registration.' });
    }
};

module.exports = {
    signup,
};