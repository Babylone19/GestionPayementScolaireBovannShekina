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
exports.updatePaymentStatus = exports.getPaymentsByStudent = exports.createPayment = void 0;
const db_1 = __importDefault(require("../utils/db"));
const ApiError_1 = require("../utils/ApiError");
const qrGenerator_1 = require("../utils/qrGenerator");
const createPayment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { studentId, amount, currency = 'XOF', reference, details, validFrom, validUntil } = req.body;
    try {
        const student = yield db_1.default.student.findUnique({
            where: { id: studentId }
        });
        if (!student)
            return next(new ApiError_1.ApiError(404, 'Student not found'));
        // Récupérer tous les paiements validés de l'étudiant
        const validatedPayments = yield db_1.default.payment.findMany({
            where: {
                studentId: studentId,
                status: 'VALID'
            }
        });
        // Calculer le montant total cumulé
        const totalValidatedAmount = validatedPayments.reduce((sum, payment) => sum + payment.amount, 0);
        const totalAmount = totalValidatedAmount + amount;
        // Créer le nouveau paiement
        const payment = yield db_1.default.payment.create({
            data: {
                amount: amount, // Montant de ce paiement spécifique
                validFrom: new Date(validFrom),
                validUntil: new Date(validUntil),
                status: 'PENDING',
                studentId: studentId,
            },
        });
        // Préparer les données pour le QR code
        const qrData = {
            studentId: student.id,
            studentName: `${student.firstName} ${student.lastName}`,
            institution: student.institution,
            totalAmount: totalAmount,
            currency: currency,
            validFrom: validFrom,
            validUntil: validUntil,
            status: 'PENDING',
            lastPaymentDate: new Date().toISOString()
        };
        const qrDataString = JSON.stringify(qrData);
        const qrImage = yield (0, qrGenerator_1.generateQR)(qrDataString);
        // Vérifier si une carte d'accès existe déjà pour cet étudiant
        const existingAccessCard = yield db_1.default.accessCard.findFirst({
            where: { studentId: studentId }
        });
        let accessCard;
        if (existingAccessCard) {
            // Mettre à jour la carte existante
            accessCard = yield db_1.default.accessCard.update({
                where: { id: existingAccessCard.id },
                data: {
                    qrData: qrImage,
                    paymentId: payment.id, // Lier à ce nouveau paiement
                },
            });
        }
        else {
            // Créer une nouvelle carte
            accessCard = yield db_1.default.accessCard.create({
                data: {
                    qrData: qrImage,
                    studentId: studentId,
                    paymentId: payment.id,
                },
            });
        }
        res.status(201).json({
            success: true,
            payment: Object.assign(Object.assign({}, payment), { cumulativeAmount: totalAmount }),
            accessCard: Object.assign(Object.assign({}, accessCard), { qrData: qrImage })
        });
    }
    catch (err) {
        console.error('Erreur création paiement:', err);
        next(new ApiError_1.ApiError(500, 'Failed to create payment and card'));
    }
});
exports.createPayment = createPayment;
const getPaymentsByStudent = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { studentId } = req.query;
    if (!studentId)
        return next(new ApiError_1.ApiError(400, 'Student ID is required'));
    try {
        const payments = yield db_1.default.payment.findMany({
            where: {
                studentId: studentId,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json({ success: true, payments });
    }
    catch (err) {
        next(new ApiError_1.ApiError(500, 'Failed to fetch payments'));
    }
});
exports.getPaymentsByStudent = getPaymentsByStudent;
const updatePaymentStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { paymentId } = req.params;
    const { status } = req.body;
    // Validation du statut selon votre enum Prisma
    const validStatuses = ['PENDING', 'VALID', 'EXPIRED'];
    if (!validStatuses.includes(status)) {
        return next(new ApiError_1.ApiError(400, 'Invalid status'));
    }
    try {
        // Récupérer le paiement avec l'étudiant et la carte d'accès
        const payment = yield db_1.default.payment.findUnique({
            where: { id: paymentId },
            include: {
                student: true,
                accessCard: true
            }
        });
        if (!payment) {
            return next(new ApiError_1.ApiError(404, 'Payment not found'));
        }
        // Mettre à jour le statut
        const updatedPayment = yield db_1.default.payment.update({
            where: { id: paymentId },
            data: { status },
        });
        // Si le statut devient VALID, regénérer le QR code avec les infos cumulées
        if (status === 'VALID') {
            // Récupérer tous les paiements validés de cet étudiant
            const allValidatedPayments = yield db_1.default.payment.findMany({
                where: {
                    studentId: payment.studentId,
                    status: 'VALID'
                }
            });
            const totalValidatedAmount = allValidatedPayments.reduce((sum, p) => sum + p.amount, 0);
            // Trouver la date de validité la plus récente
            const latestValidPayment = allValidatedPayments
                .filter(p => p.validUntil)
                .sort((a, b) => new Date(b.validUntil).getTime() - new Date(a.validUntil).getTime())[0];
            const qrData = {
                studentId: payment.student.id,
                studentName: `${payment.student.firstName} ${payment.student.lastName}`,
                institution: payment.student.institution,
                totalAmount: totalValidatedAmount,
                validFrom: (latestValidPayment === null || latestValidPayment === void 0 ? void 0 : latestValidPayment.validFrom.toISOString()) || payment.validFrom.toISOString(),
                validUntil: (latestValidPayment === null || latestValidPayment === void 0 ? void 0 : latestValidPayment.validUntil.toISOString()) || payment.validUntil.toISOString(),
                status: 'VALID',
                lastPaymentDate: new Date().toISOString()
            };
            const qrDataString = JSON.stringify(qrData);
            const qrImage = yield (0, qrGenerator_1.generateQR)(qrDataString);
            // Mettre à jour la carte d'accès
            if (payment.accessCard) {
                yield db_1.default.accessCard.update({
                    where: { id: payment.accessCard.id },
                    data: { qrData: qrImage },
                });
            }
        }
        res.json({
            success: true,
            payment: updatedPayment
        });
    }
    catch (err) {
        console.error('Erreur mise à jour statut:', err);
        next(new ApiError_1.ApiError(500, 'Failed to update payment status'));
    }
});
exports.updatePaymentStatus = updatePaymentStatus;
