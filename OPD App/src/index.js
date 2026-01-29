const express = require('express');
const cors = require('cors');

const doctorRoutes = require('./routes/doctors');
const slotRoutes = require('./routes/slots');
const tokenRoutes = require('./routes/tokens');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/doctors', doctorRoutes);
app.use('/slots', slotRoutes);
app.use('/tokens', tokenRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Hospital OPD Token Allocation Engine',
    timestamp: new Date().toISOString()
  });
});

// Home route
app.get('/', (req, res) => {
  res.json({
    message: 'Hospital OPD Token Allocation Engine',
    endpoints: {
      doctors: 'GET/POST /doctors',
      slots: 'GET/POST /slots',
      tokens: 'POST /tokens/book, /tokens/cancel, /tokens/emergency',
      schedule: 'GET /tokens/schedule/:doctorId'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🏥 Hospital OPD Token Allocation Engine running on port ${PORT}`);
  console.log(`🌐 Base URL: http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});