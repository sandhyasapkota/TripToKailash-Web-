import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import {UserRoute} from './Routes/index.js';
import {productRoute} from './Routes/index.js';
import { BookingRoutes } from './Routes/index.js';
import reviewRoutes from './Routes/Review/ReviewRoutes.js'; // ADD THIS
import dotenv from 'dotenv';
import adminRoutes from './Routes/Admin/adminRoutes.js';

dotenv.config();
import {testConnection, sequelize} from './Database/db.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Test connection and sync database
testConnection();
sequelize.sync({ alter: true }).then(() => {
  console.log('Database synced successfully');
}).catch(err => {
  console.error('Database sync error:', err);
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/users', UserRoute);
app.use('/api/products', productRoute);
app.use('/api/reviews', reviewRoutes); 
app.use('/api/admin', adminRoutes);
app.use('/api/bookings', BookingRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;