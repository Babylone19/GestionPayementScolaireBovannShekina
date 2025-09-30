"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const publicVerification_controller_1 = require("../controllers/publicVerification.controller");
const router = (0, express_1.Router)();
router.get('/verify-public', publicVerification_controller_1.publicVerifyCard);
exports.default = router;
