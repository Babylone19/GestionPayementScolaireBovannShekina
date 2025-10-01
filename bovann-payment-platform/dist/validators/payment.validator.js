"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePaymentStatusValidation = exports.createPaymentValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createPaymentValidation = [
    (0, express_validator_1.body)('studentId')
        .isUUID()
        .withMessage('Valid student ID required'),
    (0, express_validator_1.body)('amount')
        .isFloat({ min: 0 })
        .withMessage('Amount must be positive'),
    (0, express_validator_1.body)('validFrom')
        .isISO8601()
        .withMessage('ValidFrom must be ISO date'),
    (0, express_validator_1.body)('validUntil')
        .isISO8601()
        .withMessage('ValidUntil must be ISO date'),
];
exports.updatePaymentStatusValidation = [
    (0, express_validator_1.param)('paymentId')
        .isUUID()
        .withMessage('Valid payment ID required'),
    (0, express_validator_1.body)('status')
        .isIn(['PENDING', 'VALID', 'EXPIRED'])
        .withMessage('Invalid status value'),
];
