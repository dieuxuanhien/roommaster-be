import express from 'express';
import authRoute from './auth.route';
import profileRoute from './profile.route';
import bookingRoute from './booking.route';

const employeeRoute = express.Router();

employeeRoute.use('/auth', authRoute);
employeeRoute.use('/profile', profileRoute);
employeeRoute.use('/bookings', bookingRoute);

export default employeeRoute;
