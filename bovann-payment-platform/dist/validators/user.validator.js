"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createUserValidation = [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    (0, express_validator_1.body)('role')
        .isIn(['ADMIN', 'SECRETARY', 'ACCOUNTANT', 'GUARD'])
        .withMessage('Invalid role'),
];
