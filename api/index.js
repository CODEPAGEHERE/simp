require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');


// routes
const authRoutes = require('./routes/auth');



const app = express();
const prisma = new PrismaClient(); 


app.use(cors());
app.use(express.json()); 





// --- API Routes ---
app.use('/auth', authRoutes); 



app.get('/', (req, res) => {
  res.status(200).json({ message: 'API is running successfully!' });
});


app.use((err, req, res, next) => {
  console.error(err.stack); 
  res.status(500).send('Something broke on the server!');
});

module.exports = app;


if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001; // Using 3001 as per your .env
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
	
    prisma.$connect()
      .then(() => console.log("Db connected successfully (local SQLite)."))
      .catch((e) => console.error("Db connection error:", e));
  });
}

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});