const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // <--- NEW: Import jsonwebtoken

const prisma = new PrismaClient();

const login = async (req, res) => {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
        return res.status(400).json({ message: 'Username/Phone number and password are required.' });
    }

    try {
        let person = null;

        const cleanIdentifier = identifier.toLowerCase().trim();
        person = await prisma.person.findUnique({
            where: { username: cleanIdentifier },
        });

        if (!person) {
            let processedPhoneNo = identifier;
            processedPhoneNo = processedPhoneNo.replace(/[^+\d]/g, '');

            if (processedPhoneNo.startsWith('0')) {
                processedPhoneNo = '+234' + processedPhoneNo.substring(1);
            } else if (!processedPhoneNo.startsWith('+234')) {
                processedPhoneNo = '+234' + processedPhoneNo;
            }

            if (/^\+234[789]\d{9}$/.test(processedPhoneNo)) {
                person = await prisma.person.findUnique({
                    where: { phoneNo: processedPhoneNo },
                });
            }
        }

        if (!person) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        const isPasswordValid = await bcrypt.compare(password, person.passwordHash);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        // --- NEW: Generate JWT Token ---
        // Payload for the token (don't include sensitive info like passwordHash)
        const tokenPayload = {
            userId: person.id,
            username: person.username,
            // You might add roles or other non-sensitive user info here
        };

        // Sign the token
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
            expiresIn: '1h', // Token expires in 1 hour
        });
        // --- END NEW ---

        res.status(200).json({
            message: 'Login successful!',
            token: token, // <--- NEW: Send the token back to the client
            person: { // Also send some safe user data if needed (optional, token usually enough)
                id: person.id,
                name: person.name,
                username: person.username,
                phoneNo: person.phoneNo,
            }
        });

    } catch (error) {
        console.error('Error during person login:', error);
        res.status(500).json({ message: 'An unexpected error occurred during login.' });
    }
};

module.exports = {
    login,
};