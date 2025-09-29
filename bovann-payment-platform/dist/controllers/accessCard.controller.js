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
exports.scanCard = void 0;
const db_1 = __importDefault(require("../utils/db"));
const ApiError_1 = require("../utils/ApiError");
const scanCard = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { qrData } = req.body;
    const { id: guardianId } = req.user;
    try {
        // Décoder les données base64 du QR code
        const decodedData = atob(qrData);
        const parsed = JSON.parse(decodedData);
        const { studentId, totalAmount, validFrom, validUntil, status } = parsed;
        // Trouver l'étudiant avec ses paiements et cartes d'accès
        const student = yield db_1.default.student.findUnique({
            where: { id: studentId },
            include: {
                payments: {
                    where: { status: 'VALID' }
                },
                accessCards: {
                    include: {
                        payment: true
                    },
                    orderBy: { id: 'desc' } // Utilisez id pour le tri à la place de createdAt
                }
            },
        });
        if (!student) {
            return res.json({
                success: false,
                message: 'Étudiant non trouvé'
            });
        }
        const now = new Date();
        const validFromDate = new Date(validFrom);
        const validUntilDate = new Date(validUntil);
        // Vérification de la date de validité
        if (now < validFromDate) {
            return res.json({
                success: false,
                message: `Accès non encore valide pour ${student.firstName} ${student.lastName}. Valide à partir du ${validFromDate.toLocaleDateString('fr-FR')}.`
            });
        }
        if (now > validUntilDate) {
            return res.json({
                success: false,
                message: `Accès expiré pour ${student.firstName} ${student.lastName}. Valide jusqu'au ${validUntilDate.toLocaleDateString('fr-FR')}.`
            });
        }
        // Vérification du statut
        if (status !== 'VALID') {
            return res.json({
                success: false,
                message: `Paiement non validé pour ${student.firstName} ${student.lastName}.`
            });
        }
        // Vérifier s'il y a au moins un paiement validé
        const hasValidPayment = student.payments.some((payment) => payment.status === 'VALID');
        if (!hasValidPayment) {
            return res.json({
                success: false,
                message: `Aucun paiement validé pour ${student.firstName} ${student.lastName}.`
            });
        }
        // Vérification du nombre de scans aujourd'hui
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);
        // Utiliser la dernière carte d'accès
        const latestAccessCard = student.accessCards[0];
        if (!latestAccessCard) {
            return res.json({
                success: false,
                message: `Aucune carte d'accès trouvée pour ${student.firstName} ${student.lastName}.`
            });
        }
        const todayScans = yield db_1.default.scanLog.count({
            where: {
                cardId: latestAccessCard.id,
                scannedAt: { gte: startOfDay, lte: endOfDay },
            },
        });
        if (todayScans >= 1) {
            return res.json({
                success: false,
                message: `Accès déjà utilisé aujourd'hui pour ${student.firstName} ${student.lastName}.`
            });
        }
        // Enregistrement du scan
        yield db_1.default.scanLog.create({
            data: {
                cardId: latestAccessCard.id,
                guardianId,
            },
        });
        res.json({
            success: true,
            message: `Accès autorisé pour ${student.firstName} ${student.lastName} avec un montant total de ${totalAmount} FCFA.`,
            student: {
                name: `${student.firstName} ${student.lastName}`,
                institution: student.institution,
                amount: totalAmount,
            },
        });
    }
    catch (err) {
        console.error('Erreur scan:', err);
        return next(new ApiError_1.ApiError(400, 'Données QR invalides'));
    }
});
exports.scanCard = scanCard;
