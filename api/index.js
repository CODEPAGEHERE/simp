// Conditionally load dotenv for local development only
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const Express = require('express');
const Cors = require('cors');
const { PrismaClient } = require('@prisma/client');

// Routes
const AuthRoutes = require('./routes/AuthRoutes');
const ScheduleRoutes = require('./routes/ScheduleRoutes');
const DashboardRoutes = require('./routes/DashboardRoutes');

const App = Express();
const Prisma = new PrismaClient();

const AllowedOrigin = process.env.CORS_ORIGIN;

App.use(Cors({
    origin: AllowedOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

App.use(Express.json());

// API Routes
App.use('/auth', AuthRoutes);
App.use('/api', ScheduleRoutes);
App.use('/dashboard', DashboardRoutes);

App.get('/', (req, res) => { 
    res.status(200).json({ Message: 'API is running successfully!' }); 
});

// Error handling middleware
App.use((err, req, res, next) => { 
    console.error(err.stack); 
    res.status(500).send('Something broke on the server!');
});

module.exports = App;

if (process.env.NODE_ENV !== 'production') {
    const Port = process.env.PORT; 
    App.listen(Port, () => {
        console.log(`Backend server running on http://localhost:${Port}`);

        Prisma.$connect()
            .then(() => console.log("Db connected successfully (Neon with Prisma)."))
            .catch((e) => console.error("Db connection error:", e)); 
    });
}

process.on('beforeExit', async () => {
    await Prisma.$disconnect();
});