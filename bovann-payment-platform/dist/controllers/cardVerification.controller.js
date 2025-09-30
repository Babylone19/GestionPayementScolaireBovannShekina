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
exports.verifyCard = void 0;
const db_1 = __importDefault(require("../utils/db"));
const ApiError_1 = require("../utils/ApiError");
const verifyCard = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { studentId } = req.query;
    try {
        if (!studentId) {
            return res.status(400).json({
                success: false,
                message: 'ID étudiant requis'
            });
        }
        // Trouver l'étudiant avec ses paiements validés
        const student = yield db_1.default.student.findUnique({
            where: { id: studentId },
            include: {
                payments: {
                    where: {
                        status: 'VALID'
                    },
                    orderBy: { validUntil: 'desc' }
                }
            }
        });
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Étudiant non trouvé'
            });
        }
        const now = new Date();
        const hasValidPayment = student.payments.length > 0;
        const latestPayment = student.payments[0];
        if (!hasValidPayment) {
            return res.json({
                success: false,
                studentName: `${student.firstName} ${student.lastName}`,
                institution: student.institution,
                message: 'Aucun paiement valide trouvé',
                status: 'REFUSED'
            });
        }
        // Vérifier si le paiement est encore valide
        const isValid = latestPayment.validUntil >= now && latestPayment.validFrom <= now;
        res.json({
            success: isValid,
            studentName: `${student.firstName} ${student.lastName}`,
            institution: student.institution,
            amount: latestPayment.amount,
            validFrom: latestPayment.validFrom,
            validUntil: latestPayment.validUntil,
            message: isValid
                ? 'Accès AUTORISÉ'
                : 'Paiement expiré',
            status: isValid ? 'AUTHORIZED' : 'EXPIRED'
        });
    }
    catch (err) {
        console.error('Erreur vérification carte:', err);
        next(new ApiError_1.ApiError(500, 'Erreur lors de la vérification'));
    }
});
exports.verifyCard = verifyCard;
