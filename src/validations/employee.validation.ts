import Joi from 'joi';

const login = {
  body: Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().required()
  })
};

const forgotPassword = {
  body: Joi.object().keys({
    username: Joi.string().required()
  })
};

const updateProfile = {
  body: Joi.object()
    .keys({
      name: Joi.string().max(100)
    })
    .min(1)
};

export default {
  login,
  forgotPassword,
  updateProfile
};
