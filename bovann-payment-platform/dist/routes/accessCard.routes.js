"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const accessCard_controller_1 = require("../controllers/accessCard.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const express_validator_1 = require("express-validator");
const ApiError_1 = require("../utils/ApiError");
const router = (0, express_1.Router)();
router.post('/scan', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRoles)('GUARD'), (0, express_validator_1.body)('qrData').notEmpty().withMessage('QR data is required'), (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new ApiError_1.ApiError(400, errors.array()[0].msg));
    }
    next();
}, accessCard_controller_1.scanCard);
exports.default = router;
