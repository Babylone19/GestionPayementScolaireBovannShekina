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
exports.getAllStudents = exports.createStudent = void 0;
const db_1 = __importDefault(require("../utils/db"));
const ApiError_1 = require("../utils/ApiError");
const express_validator_1 = require("express-validator");
const createStudent = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    const studentData = req.body;
    try {
        // Vérifier si l'étudiant existe déjà - version alternative
        const existingStudent = yield db_1.default.student.findMany({
            where: {
                OR: [
                    { email: studentData.email },
                    { phone: studentData.phone }
                ]
            },
        });
        if (existingStudent.length > 0) {
            return next(new ApiError_1.ApiError(409, 'Un étudiant avec cet email ou téléphone existe déjà'));
        }
        const student = yield db_1.default.student.create({
            data: studentData,
        });
        res.status(201).json({ success: true, student });
    }
    catch (err) {
        console.error('Erreur création étudiant:', err);
        // Gestion spécifique des erreurs Prisma
        if (err.code === 'P2002') {
            return next(new ApiError_1.ApiError(409, 'Un étudiant avec cet email existe déjà'));
        }
        next(new ApiError_1.ApiError(500, 'Erreur lors de la création de l\'étudiant'));
    }
});
exports.createStudent = createStudent;
const getAllStudents = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(' Récupération des étudiants...');
        const students = yield db_1.default.student.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });
        console.log(` ${students.length} étudiants récupérés avec succès`);
        res.json({ success: true, students });
    }
    catch (err) {
        console.error(' Erreur récupération étudiants:', err);
        next(new ApiError_1.ApiError(500, 'Erreur lors de la récupération des étudiants'));
    }
});
exports.getAllStudents = getAllStudents;
