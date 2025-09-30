"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cardVerification_controller_1 = require("../controllers/cardVerification.controller");
const router = (0, express_1.Router)();
router.get('/verify', cardVerification_controller_1.verifyCard);
exports.default = router;
