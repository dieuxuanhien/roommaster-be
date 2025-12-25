import express from 'express';
import { authEmployee } from 'middlewares/auth';
import validate from 'middlewares/validate';
import { serviceValidation } from 'validations';
import { container, TOKENS } from 'core/container';
import { ServiceService } from 'services';
import { ServiceController } from 'controllers/employee/employee.service.controller';

const serviceRoute = express.Router();

// Manually instantiate controller with dependencies
const serviceService = container.resolve<ServiceService>(TOKENS.ServiceService);
const serviceController = new ServiceController(serviceService);

serviceRoute
  .route('/')
  .post(authEmployee, validate(serviceValidation.createService), serviceController.createService)
  .get(authEmployee, validate(serviceValidation.getServices), serviceController.getServices);

serviceRoute
  .route('/:serviceId')
  .get(authEmployee, validate(serviceValidation.getService), serviceController.getService)
  .put(authEmployee, validate(serviceValidation.updateService), serviceController.updateService)
  .delete(authEmployee, validate(serviceValidation.deleteService), serviceController.deleteService);

export default serviceRoute;
