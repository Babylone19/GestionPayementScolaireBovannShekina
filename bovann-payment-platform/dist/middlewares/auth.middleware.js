"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ApiError_1 = require("../utils/ApiError");
const db_1 = __importDefault(require("../utils/db"));
const authenticateToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new ApiError_1.ApiError(401, 'Access token missing'));
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = yield db_1.default.user.findUnique({ where: { id: decoded.id } });
        if (!user)
            return next(new ApiError_1.ApiError(401, 'User not found'));
        req.user = { id: user.id, role: user.role };
        next();
    }
    catch (err) {
        return next(new ApiError_1.ApiError(403, 'Invalid or expired token'));
    }
});
exports.authenticateToken = authenticateToken;
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return next(new ApiError_1.ApiError(403, 'Access denied'));
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
