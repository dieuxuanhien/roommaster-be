import { PaymentMethod, TransactionType } from '@prisma/client';
import Joi from 'joi';

const promotionApplication = Joi.object({
  customerPromotionId: Joi.string().required(),
  bookingRoomId: Joi.string().optional(),
  serviceUsageId: Joi.string().optional()
});

const createTransaction = {
  body: Joi.object().keys({
    bookingId: Joi.string().optional(),
    bookingRoomIds: Joi.array().items(Joi.string()).optional(),
    serviceUsageId: Joi.string().optional(),
    paymentMethod: Joi.string()
      .valid(...Object.values(PaymentMethod))
      .required(),
    transactionType: Joi.string()
      .valid(...Object.values(TransactionType))
      .required(),
    transactionRef: Joi.string().optional(),
    description: Joi.string().optional(),
    promotionApplications: Joi.array().items(promotionApplication).optional()
  })
};

export default {
  createTransaction
};
