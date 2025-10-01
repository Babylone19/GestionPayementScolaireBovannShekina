"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const publicVerification_controller_1 = require("../controllers/publicVerification.controller");
const publicHistory_controller_1 = require("../controllers/publicHistory.controller");
const router = (0, express_1.Router)();
router.get('/verify-public', publicVerification_controller_1.publicVerifyCard);
router.get('/student-history/:studentId', publicHistory_controller_1.getStudentHistory);
exports.default = router;
