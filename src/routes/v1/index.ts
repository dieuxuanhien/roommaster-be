import express from 'express';
import employeeRoute from './employee';
import customerRoute from './customer';

const router = express.Router();

const defaultRoutes = [
  {
    path: '/employee',
    route: employeeRoute
  },
  {
    path: '/customer',
    route: customerRoute
  }
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
