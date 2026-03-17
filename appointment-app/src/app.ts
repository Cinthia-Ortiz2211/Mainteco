import express from 'express';
import bodyParser from 'body-parser';
import appointmentRoutes from './api/appointments';
import paymentRoutes from './api/payments';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// API Routes
app.use('/api/appointments', appointmentRoutes);
app.use('/api/payments', paymentRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});