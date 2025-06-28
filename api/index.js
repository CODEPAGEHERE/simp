// File: backend/index.js

// Conditionally load dotenv for local development only
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const Express = require('express'); // Changed to PascalCase
const Cors = require('cors');       // Changed to PascalCase
const { PrismaClient } = require('@prisma/client'); // PrismaClient already PascalCase, no change

// Routes - These will be updated to reflect their PascalCase file names and internal variables
const AuthRoutes = require('./routes/AuthRoutes');         // Will assume AuthRoutes.js exists
const ScheduleRoutes = require('./routes/ScheduleRoutes'); // Will assume ScheduleRoutes.js exists
const DashboardRoutes = require('./routes/DashboardRoutes'); // Will assume DashboardRoutes.js exists

const App = Express(); // Changed to PascalCase
const Prisma = new PrismaClient(); // Changed to PascalCase

// --- UPDATED CORS CONFIGURATION using environment variable ---
const AllowedOrigin = process.env.CORS_ORIGIN; // Changed to PascalCase

App.use(Cors({
    origin: AllowedOrigin, // Using PascalCase variable here
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
// --- END UPDATED CORS CONFIGURATION ---

App.use(Express.json()); // Changed to PascalCase

// --- API Routes ---
App.use('/auth', AuthRoutes);
App.use('/api', ScheduleRoutes);
App.use('/dashboard', DashboardRoutes);

App.get('/', (Req, Res) => { // Changed parameters to PascalCase
    Res.status(200).json({ Message: 'API is running successfully!' }); // Changed Message to PascalCase
});

// Error handling middleware
App.use((Err, Req, Res, Next) => { // Changed parameters to PascalCase
    console.error(Err.stack);
    Res.status(500).send('Something broke on the server!');
});

module.exports = App; // Exporting the PascalCase App

if (process.env.NODE_ENV !== 'production') {
    const Port = process.env.PORT; // Changed to PascalCase
    App.listen(Port, () => {
        console.log(`Backend server running on http://localhost:${Port}`);

        Prisma.$connect()
            .then(() => console.log("Db connected successfully (Neon with Prisma)."))
            .catch((E) => console.error("Db connection error:", E)); // Changed parameter to PascalCase
    });
}

process.on('beforeExit', async () => {
    await Prisma.$disconnect();
});