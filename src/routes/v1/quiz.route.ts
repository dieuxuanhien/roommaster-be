import express from 'express';
import validate from 'middlewares/validate';
import { quizController } from 'controllers';
import { quizValidation } from 'validations';
import auth from 'middlewares/auth';

const router = express.Router();

// Public routes - get available quizzes
router.get('/', validate(quizValidation.getAllQuizzesValidation), quizController.getAllQuizzes);

// Protected routes - require authentication
router.post(
  '/submit',
  auth(),
  validate(quizValidation.submitQuizValidation),
  quizController.submitQuiz
);
router.get(
  '/results/history',
  auth(),
  validate(quizValidation.getUserQuizHistoryValidation),
  quizController.getUserQuizHistory
);
router.get(
  '/results/:quizId',
  auth(),
  validate(quizValidation.getUserQuizResultValidation),
  quizController.getUserQuizResult
);

// These routes should be last to avoid route conflicts
router.get(
  '/code/:code',
  validate(quizValidation.getQuizByCodeValidation),
  quizController.getQuizByCode
);
router.get('/:quizId', validate(quizValidation.getQuizByIdValidation), quizController.getQuizById);

export default router;

/**
 * @swagger
 * tags:
 *   name: Quiz
 *   description: Quiz management and submission
 */

/**
 * @swagger
 * /quiz:
 *   get:
 *     summary: Get all available quizzes with pagination
 *     tags: [Quiz]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       code:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       category:
 *                         type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 */

/**
 * @swagger
 * /quiz/code/{code}:
 *   get:
 *     summary: Get quiz by code with questions and options
 *     tags: [Quiz]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz code (e.g., DASS21, BDI, HOLLAND)
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 quiz:
 *                   type: object
 *       "404":
 *         description: Quiz not found
 */

/**
 * @swagger
 * /quiz/{quizId}:
 *   get:
 *     summary: Get quiz by ID with questions and options
 *     tags: [Quiz]
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Quiz ID
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 quiz:
 *                   type: object
 *       "404":
 *         description: Quiz not found
 */

/**
 * @swagger
 * /quiz/submit:
 *   post:
 *     summary: Submit quiz answers
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quizId
 *               - answers
 *             properties:
 *               quizId:
 *                 type: integer
 *                 description: ID of the quiz being submitted
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - questionId
 *                     - selectedOptionIds
 *                   properties:
 *                     questionId:
 *                       type: integer
 *                       description: ID of the question
 *                     selectedOptionIds:
 *                       type: array
 *                       items:
 *                         type: integer
 *                       description: Array of selected option IDs
 *             example:
 *               quizId: 1
 *               answers:
 *                 - questionId: 5
 *                   selectedOptionIds: [12]
 *                 - questionId: 6
 *                   selectedOptionIds: [15]
 *     responses:
 *       "201":
 *         description: Quiz submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     totalScore:
 *                       type: number
 *                     level:
 *                       type: string
 *                     resultJson:
 *                       type: object
 *       "400":
 *         description: Bad request - invalid answers or missing questions
 *       "401":
 *         description: Unauthorized
 *       "404":
 *         description: Quiz not found
 */

/**
 * @swagger
 * /quiz/results/history:
 *   get:
 *     summary: Get user's quiz history with pagination
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *       "401":
 *         description: Unauthorized
 */

/**
 * @swagger
 * /quiz/results/{quizId}:
 *   get:
 *     summary: Get user's result for a specific quiz
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Quiz ID
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: object
 *       "401":
 *         description: Unauthorized
 */
