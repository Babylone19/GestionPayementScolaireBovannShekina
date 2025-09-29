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
exports.deleteUser = exports.updateUser = exports.getUserById = exports.getAllUsers = exports.createUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = __importDefault(require("../utils/db"));
const ApiError_1 = require("../utils/ApiError");
// Créer un utilisateur (ADMIN)
const createUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, role } = req.body;
    const existing = yield db_1.default.user.findUnique({ where: { email } });
    if (existing)
        return next(new ApiError_1.ApiError(409, 'User already exists'));
    const hashed = yield bcryptjs_1.default.hash(password, 12);
    const user = yield db_1.default.user.create({
        data: { email, password: hashed, role },
        select: { id: true, email: true, role: true },
    });
    res.status(201).json({ success: true, user });
});
exports.createUser = createUser;
// Lister tous les utilisateurs (ADMIN)
const getAllUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield db_1.default.user.findMany({
            select: { id: true, email: true, role: true, createdAt: true },
        });
        res.json({ success: true, users });
    }
    catch (err) {
        next(new ApiError_1.ApiError(500, 'Failed to fetch users'));
    }
});
exports.getAllUsers = getAllUsers;
// Obtenir un utilisateur par ID (ADMIN)
const getUserById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const user = yield db_1.default.user.findUnique({
            where: { id },
            select: { id: true, email: true, role: true, createdAt: true },
        });
        if (!user)
            return next(new ApiError_1.ApiError(404, 'User not found'));
        res.json({ success: true, user });
    }
    catch (err) {
        next(new ApiError_1.ApiError(500, 'Failed to fetch user'));
    }
});
exports.getUserById = getUserById;
// Mettre à jour un utilisateur (ADMIN)
const updateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const { email, role, password } = req.body;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) === id) {
        return next(new ApiError_1.ApiError(403, 'You cannot modify your own account via this endpoint'));
    }
    try {
        const updateData = {};
        if (email)
            updateData.email = email;
        if (role && ['ADMIN', 'SECRETARY', 'ACCOUNTANT', 'GUARD'].includes(role)) {
            updateData.role = role;
        }
        if (password) {
            updateData.password = yield bcryptjs_1.default.hash(password, 12);
        }
        const user = yield db_1.default.user.update({
            where: { id },
            data: updateData,
            select: { id: true, email: true, role: true },
        });
        res.json({ success: true, user });
    }
    catch (err) {
        if (err.code === 'P2025') {
            return next(new ApiError_1.ApiError(404, 'User not found'));
        }
        next(new ApiError_1.ApiError(500, 'Failed to update user'));
    }
});
exports.updateUser = updateUser;
// Supprimer un utilisateur (ADMIN)
const deleteUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) === id) {
        return next(new ApiError_1.ApiError(403, 'You cannot delete your own account'));
    }
    try {
        yield db_1.default.user.delete({ where: { id } });
        res.json({ success: true, message: 'User deleted successfully' });
    }
    catch (err) {
        if (err.code === 'P2025') {
            return next(new ApiError_1.ApiError(404, 'User not found'));
        }
        next(new ApiError_1.ApiError(500, 'Failed to delete user'));
    }
});
exports.deleteUser = deleteUser;
