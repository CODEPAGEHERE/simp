const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const signup = async (req, res) => {
    // Destructure fields from the request body
    const { name, phoneNo, username, password } = req.body;

    // 1. Initial Data Cleaning & Preparation
    const processedName = name ? name.toLowerCase() : ''; 
    let processedPhoneNo = phoneNo; // Keep as is initially for specific processing
    const cleanUsername = username ? username.toLowerCase().trim() : ''; // Trim and lowercase for username
    const cleanPassword = password ? password.trim() : ''; // Trim password for validation

    // 2. Comprehensive Input Validation

    // Check for presence of all required fields AFTER initial processing
    if (!processedName || !processedPhoneNo || !cleanUsername || !cleanPassword) {
        return res.status(400).json({ message: 'All fields (name, phone number, username, password) are required.' });
    }

    // Name Validation:
    if (processedName.length < 5 || processedName.length > 50) {
        return res.status(400).json({ message: 'Your Name must be between 5 and 50 characters long.' });
    }
    // c. Only alphabets allowed, no numbers or special characters
    if (!/^[a-z]+$/.test(processedName)) {
        return res.status(400).json({ message: 'Name can only contain lowercase alphabets, no numbers or special characters.' });
    }

    // Phone Number Validation:
    // Normalize phone number first by removing all non-digit characters except the leading '+'
    processedPhoneNo = processedPhoneNo.replace(/[^+\d]/g, '');

    // Rule: if it starts with '0', replace with '+234'
    if (processedPhoneNo.startsWith('0')) {
        processedPhoneNo = '+234' + processedPhoneNo.substring(1);
    }
    // Rule: if it doesn't start with '+234', add '+234'
    else if (!processedPhoneNo.startsWith('+234')) {
        processedPhoneNo = '+234' + processedPhoneNo;
    }

    // Rule: Ensure '+' is only at the beginning (+2345+648 is invalid)
    if ((processedPhoneNo.match(/\+/g) || []).length > 1) {
        return res.status(400).json({ message: 'Invalid phone number format: "+" can only appear at the beginning.' });
    }

    // After normalization, apply final validation rules
    // Rule: After +234, the next digit must be 7, 8, or 9
    // Rule: Total length for a Nigerian number starting with +234 is 14 characters (+234 and 10 digits)
    if (!/^\+234[789]\d{9}$/.test(processedPhoneNo)) {
        return res.status(400).json({ message: 'Invalid Nigerian phone number format. Must start with +234, 0, or implied +234, followed by 7, 8, or 9 and 9 more digits.' });
    }


    // Username Validation (no changes from previous requirements):
    // a. All lowercase already handled by .toLowerCase().trim()
    // b. Only letters and numbers allowed, no special characters
    if (!/^[a-z0-9]+$/.test(cleanUsername)) {
        return res.status(400).json({ message: 'Username can only contain lowercase letters and numbers, no special characters or spaces.' });
    }

    // Password Validation (no changes from previous requirements):
    // a. Must be 8 characters
    if (cleanPassword.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }
    // b. Can include numbers, no special characters allowed (only letters and numbers)
    if (!/^[a-zA-Z0-9]+$/.test(cleanPassword)) {
        return res.status(400).json({ message: 'Password can only contain letters and numbers, no special characters or spaces allowed.' });
    }

    // Prevent username and password from being the same set of characters
    if (cleanUsername === cleanPassword) {
        return res.status(400).json({ message: 'Username and password cannot be the same.' });
    }

    try {
        // 3. Check for existing Person based on unique fields (`phoneNo` and `username`)
        const existingPersonByPhoneNo = await prisma.person.findUnique({
            where: { phoneNo: processedPhoneNo }, // Use processed phone number
        });
        if (existingPersonByPhoneNo) {
            return res.status(409).json({ message: 'A person with this phone number already exists.' });
        }

        const existingPersonByUsername = await prisma.person.findUnique({
            where: { username: cleanUsername }, // Use cleaned username
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

        // Enhanced Prisma unique constraint error handling
        if (error.code === 'P2002') {
            if (error.meta && error.meta.target) {
                if (error.meta.target.includes('phoneNo')) {
                    return res.status(409).json({ message: 'A person with this phone number already exists.' });
                }
                if (error.meta.target.includes('username')) {
                    return res.status(409).json({ message: 'A person with this username already exists.' });
                }
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