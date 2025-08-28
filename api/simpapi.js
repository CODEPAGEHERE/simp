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
const CategoryRoutes = require('./routes/CategoryRoutes');


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
App.use('/categories', CategoryRoutes);
App.use('/auth', AuthRoutes);
App.use('/api', ScheduleRoutes);
App.use('/dashboard', DashboardRoutes);





App.get('/', (req, res) => {
    res.status(200).json({ Message: ' SimpApi is running successfully!' });
});
// Error handling middleware
App.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('SimpApi Broke!');
});



module.exports = App;



if (process.env.NODE_ENV !== 'production') {
    const Port = process.env.PORT;
    App.listen(Port, () => {
        console.log(` The  SimpApi is running on http://localhost:${Port}`);

        Prisma.$connect()
            .then(() => console.log(" SimpDB has connected successfully."))
            .catch((e) => console.error(" SimpDB connection error:", e));
    });
}
process.on('beforeExit', async () => {
    await Prisma.$disconnect();
});
