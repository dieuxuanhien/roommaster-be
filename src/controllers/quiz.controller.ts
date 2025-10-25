import httpStatus from 'http-status';
import catchAsync from 'utils/catchAsync';
import { quizService } from 'services';
import { User } from '@prisma/client';

const getAllQuizzes = catchAsync(async (req, res) => {
  const page = req.query.page ? Number(req.query.page) : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;

  const result = await quizService.getAllQuizzes({ page, limit });
  res.send(result);
});

const getQuizById = catchAsync(async (req, res) => {
  const quiz = await quizService.getQuizById(Number(req.params.quizId));
  res.send({ quiz });
});

const getQuizByCode = catchAsync(async (req, res) => {
  const quiz = await quizService.getQuizByCode(req.params.code);
  res.send({ quiz });
});

const submitQuiz = catchAsync(async (req, res) => {
  const user = req.user as User;
  const result = await quizService.submitQuiz(user.id, req.body);
  res.status(httpStatus.CREATED).send({ result });
});

const getUserQuizHistory = catchAsync(async (req, res) => {
  const user = req.user as User;
  const page = req.query.page ? Number(req.query.page) : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;

  const result = await quizService.getUserQuizHistory(user.id, { page, limit });
  res.send(result);
});

const getUserQuizResult = catchAsync(async (req, res) => {
  const user = req.user as User;
  const result = await quizService.getUserQuizResult(user.id, Number(req.params.quizId));
  res.send({ result });
});

export default {
  getAllQuizzes,
  getQuizById,
  getQuizByCode,
  submitQuiz,
  getUserQuizHistory,
  getUserQuizResult
};
