import Joi from 'joi';

const getAllQuizzes = {
  query: Joi.object().keys({})
};

const getQuizById = {
  params: Joi.object().keys({
    quizId: Joi.number().integer().required()
  })
};

const getQuizByCode = {
  params: Joi.object().keys({
    code: Joi.string().required()
  })
};

const submitQuiz = {
  body: Joi.object().keys({
    quizId: Joi.number().integer().required(),
    answers: Joi.array()
      .items(
        Joi.object().keys({
          questionId: Joi.number().integer().required(),
          selectedOptionIds: Joi.array().items(Joi.number().integer()).min(1).required()
        })
      )
      .min(1)
      .required()
  })
};

const getUserQuizHistory = {
  query: Joi.object().keys({})
};

const getUserQuizResult = {
  params: Joi.object().keys({
    quizId: Joi.number().integer().required()
  })
};

// Validation schemas
const getAllQuizzesValidation = {
  query: Joi.object().keys({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100)
  })
};

const getQuizByIdValidation = {
  params: Joi.object().keys({
    quizId: Joi.number().integer().required()
  })
};

const getQuizByCodeValidation = {
  params: Joi.object().keys({
    code: Joi.string().required()
  })
};

const submitQuizValidation = {
  body: Joi.object().keys({
    quizId: Joi.number().integer().required(),
    answers: Joi.array()
      .items(
        Joi.object().keys({
          questionId: Joi.number().integer().required(),
          optionIds: Joi.array().items(Joi.number().integer()).min(1).required()
        })
      )
      .min(1)
      .required()
  })
};

const getUserQuizHistoryValidation = {
  query: Joi.object().keys({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100)
  })
};

const getUserQuizResultValidation = {
  params: Joi.object().keys({
    quizId: Joi.number().integer().required()
  })
};

export default {
  getAllQuizzes,
  getQuizById,
  getQuizByCode,
  submitQuiz,
  getUserQuizHistory,
  getUserQuizResult,
  getAllQuizzesValidation,
  getQuizByIdValidation,
  getQuizByCodeValidation,
  submitQuizValidation,
  getUserQuizHistoryValidation,
  getUserQuizResultValidation
};
