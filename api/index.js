// Conditionally load dotenv for local development only
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');



// routes
const authRoutes = require('./routes/auth');
const scheduleRoutes = require('./routes/scheduleRoutes');



const app = express();
const prisma = new PrismaClient(); 

// --- UPDATED CORS CONFIGURATION using environment variable ---
const allowedOrigin = process.env.CORS_ORIGIN 

app.use(cors({
    origin: allowedOrigin, // Use the environment variable here
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
// --- END UPDATED CORS CONFIGURATION ---


app.use(express.json()); 




// --- API Routes ---
app.use('/auth', authRoutes); 
app.use('/api', scheduleRoutes);






app.get('/', (req, res) => {
  res.status(200).json({ message: 'API is running successfully!' });
});


app.use((err, req, res, next) => {
  console.error(err.stack); 
  res.status(500).send('Something broke on the server!');
});

module.exports = app;




if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT ;
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
	
    prisma.$connect()
      .then(() => console.log("Db connected successfully (Neon with Prisma)."))
      .catch((e) => console.error("Db connection error:", e));
  });
}

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});