"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const student_controller_1 = require("../controllers/student.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const student_validator_1 = require("../validators/student.validator");
const express_validator_1 = require("express-validator");
const ApiError_1 = require("../utils/ApiError");
const router = (0, express_1.Router)();
router.post('/', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRoles)('SECRETARY', 'ADMIN'), ...student_validator_1.createStudentValidation, // Ceci inclut maintenant les nouvelles validations
(req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new ApiError_1.ApiError(400, errors.array()[0].msg));
    }
    next();
}, student_controller_1.createStudent);
router.get('/', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRoles)('SECRETARY', 'ADMIN', 'ACCOUNTANT'), student_controller_1.getAllStudents);
exports.default = router;
