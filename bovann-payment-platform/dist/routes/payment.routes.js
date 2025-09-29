"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_1 = require("../controllers/payment.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const payment_validator_1 = require("../validators/payment.validator");
const express_validator_1 = require("express-validator");
const ApiError_1 = require("../utils/ApiError");
const router = (0, express_1.Router)();
// Route pour créer un paiement
router.post('/', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRoles)('ACCOUNTANT'), ...payment_validator_1.createPaymentValidation, (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new ApiError_1.ApiError(400, errors.array()[0].msg));
    }
    next();
}, payment_controller_1.createPayment);
// Route pour récupérer les paiements d'un étudiant
router.get('/', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRoles)('ACCOUNTANT'), payment_controller_1.getPaymentsByStudent);
// Route pour mettre à jour le statut d'un paiement
router.patch('/:paymentId/status', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRoles)('ACCOUNTANT'), ...payment_validator_1.updatePaymentStatusValidation, (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new ApiError_1.ApiError(400, errors.array()[0].msg));
    }
    next();
}, payment_controller_1.updatePaymentStatus);
exports.default = router;
