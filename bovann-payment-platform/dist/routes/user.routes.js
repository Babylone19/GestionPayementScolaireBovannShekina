"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const user_validator_1 = require("../validators/user.validator");
const express_validator_1 = require("express-validator");
const ApiError_1 = require("../utils/ApiError");
const router = (0, express_1.Router)();
// Seul l'ADMIN peut gérer les utilisateurs
router.post('/', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRoles)('ADMIN'), ...user_validator_1.createUserValidation, (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new ApiError_1.ApiError(400, errors.array()[0].msg));
    }
    next();
}, user_controller_1.createUser);
router.get('/', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRoles)('ADMIN'), user_controller_1.getAllUsers);
router.get('/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRoles)('ADMIN'), user_controller_1.getUserById);
router.patch('/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRoles)('ADMIN'), user_controller_1.updateUser);
router.delete('/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRoles)('ADMIN'), user_controller_1.deleteUser);
exports.default = router;
