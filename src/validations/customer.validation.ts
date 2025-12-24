import Joi from 'joi';
import { password } from './custom.validation';

const register = {
  body: Joi.object().keys({
    fullName: Joi.string().required().max(100),
    phone: Joi.string().required().max(20),
    password: Joi.string().required().custom(password),
    email: Joi.string().email().optional(),
    idNumber: Joi.string().optional().max(20),
    address: Joi.string().optional()
  })
};

const login = {
  body: Joi.object().keys({
    phone: Joi.string().required(),
    password: Joi.string().required()
  })
};

const forgotPassword = {
  body: Joi.object().keys({
    phone: Joi.string().required()
  })
};

const updateProfile = {
  body: Joi.object()
    .keys({
      fullName: Joi.string().max(100),
      email: Joi.string().email(),
      idNumber: Joi.string().max(20),
      address: Joi.string()
    })
    .min(1)
};

export default {
  register,
  login,
  forgotPassword,
  updateProfile
};
