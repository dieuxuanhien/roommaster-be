import httpStatus from 'http-status';
import prisma from 'prisma';
import { Quiz, UserResult } from '@prisma/client';
import ApiError from 'utils/ApiError';

interface PaginationOptions {
  page?: number;
  limit?: number;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
}

/**
 * Get all quizzes with pagination
 * @param {PaginationOptions} options
 * @returns {Promise<PaginatedResponse<Quiz>>}
 */
const getAllQuizzes = async (options: PaginationOptions = {}): Promise<PaginatedResponse<Quiz>> => {
  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;

  const [quizzes, totalItems] = await Promise.all([
    prisma.quiz.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.quiz.count()
  ]);

  return {
    data: quizzes,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit),
      totalItems
    }
  };
};

/**
 * Get quiz by ID with questions and options
 * @param {number} quizId
 * @returns {Promise<Quiz>}
 */
const getQuizById = async (quizId: number): Promise<Quiz | null> => {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        orderBy: { order: 'asc' },
        include: {
          options: true
        }
      }
    }
  });

  if (!quiz) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Quiz not found');
  }

  return quiz;
};

/**
 * Get quiz by code with questions and options
 * @param {string} code
 * @returns {Promise<Quiz>}
 */
const getQuizByCode = async (code: string): Promise<Quiz | null> => {
  const quiz = await prisma.quiz.findUnique({
    where: { code },
    include: {
      questions: {
        orderBy: { order: 'asc' },
        include: {
          options: true
        }
      }
    }
  });

  if (!quiz) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Quiz not found');
  }

  return quiz;
};

interface QuizAnswer {
  questionId: number;
  selectedOptionIds: number[];
}

interface QuizSubmission {
  quizId: number;
  answers: QuizAnswer[];
}

/**
 * Calculate quiz score and save result
 * @param {number} userId
 * @param {QuizSubmission} submission
 * @returns {Promise<UserResult>}
 */
const submitQuiz = async (userId: number, submission: QuizSubmission): Promise<UserResult> => {
  const { quizId, answers } = submission;

  // Get quiz with questions and options
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        include: {
          options: true
        }
      }
    }
  });

  if (!quiz) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Quiz not found');
  }

  // Validate that all questions are answered
  const questionIds = quiz.questions.map((q) => q.id);
  const answeredQuestionIds = answers.map((a) => a.questionId);
  const missingQuestions = questionIds.filter((id) => !answeredQuestionIds.includes(id));

  if (missingQuestions.length > 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'All questions must be answered');
  }

  // Calculate total score and detailed scores
  let totalScore = 0;
  const detailedScores: { [key: string]: number } = {};

  for (const answer of answers) {
    const question = quiz.questions.find((q) => q.id === answer.questionId);

    if (!question) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Invalid question ID: ${answer.questionId}`);
    }

    // Calculate score for this question
    let questionScore = 0;
    for (const optionId of answer.selectedOptionIds) {
      const option = question.options.find((o) => o.id === optionId);

      if (!option) {
        throw new ApiError(httpStatus.BAD_REQUEST, `Invalid option ID: ${optionId}`);
      }

      questionScore += option.score;
    }

    totalScore += questionScore;
    detailedScores[`question_${question.order}`] = questionScore;
  }

  // Determine level based on score (this is a simple example, adjust based on quiz type)
  let level = 'Normal';
  const averageScore = totalScore / quiz.questions.length;

  if (averageScore >= 3) {
    level = 'Nặng';
  } else if (averageScore >= 2) {
    level = 'Trung bình';
  } else if (averageScore >= 1) {
    level = 'Nhẹ';
  }

  // Save result
  const result = await prisma.userResult.create({
    data: {
      userId,
      quizId,
      totalScore,
      level,
      resultJson: detailedScores
    },
    include: {
      quiz: {
        select: {
          code: true,
          name: true,
          description: true,
          category: true
        }
      }
    }
  });

  return result;
};

/**
 * Get user's quiz history with pagination
 * @param {number} userId
 * @param {PaginationOptions} options
 * @returns {Promise<PaginatedResponse<UserResult>>}
 */
const getUserQuizHistory = async (
  userId: number,
  options: PaginationOptions = {}
): Promise<PaginatedResponse<UserResult>> => {
  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;

  const [results, totalItems] = await Promise.all([
    prisma.userResult.findMany({
      where: { userId },
      skip,
      take: limit,
      include: {
        quiz: {
          select: {
            code: true,
            name: true,
            description: true,
            category: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.userResult.count({ where: { userId } })
  ]);

  return {
    data: results,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit),
      totalItems
    }
  };
};

/**
 * Get user's result for a specific quiz
 * @param {number} userId
 * @param {number} quizId
 * @returns {Promise<UserResult | null>}
 */
const getUserQuizResult = async (userId: number, quizId: number): Promise<UserResult | null> => {
  return prisma.userResult.findFirst({
    where: {
      userId,
      quizId
    },
    include: {
      quiz: {
        select: {
          code: true,
          name: true,
          description: true,
          category: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

export default {
  getAllQuizzes,
  getQuizById,
  getQuizByCode,
  submitQuiz,
  getUserQuizHistory,
  getUserQuizResult
};
