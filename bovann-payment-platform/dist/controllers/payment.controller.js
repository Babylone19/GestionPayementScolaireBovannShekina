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
        const payment = yield db_1.default.payment.create({
            data: {
                amount: amount,
                validFrom: new Date(validFrom),
                validUntil: new Date(validUntil),
                status: 'VALID',
                studentId: studentId,
            },
        });
        const allPayments = yield db_1.default.payment.findMany({
            where: {
                studentId: studentId,
                status: 'VALID'
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        const totalAmount = allPayments.reduce((sum, p) => sum + p.amount, 0);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3009';
        const historyUrl = `${frontendUrl}/student-history/${student.id}`;
        const qrData = historyUrl;
        const qrImage = yield (0, qrGenerator_1.generateQR)(qrData);
        const existingAccessCard = yield db_1.default.accessCard.findFirst({
            where: { studentId: studentId }
        });
        let accessCard;
        if (existingAccessCard) {
            accessCard = yield db_1.default.accessCard.update({
                where: { id: existingAccessCard.id },
                data: {
                    qrData: qrImage,
                },
            });
        }
        else {
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
            payment,
            accessCard: Object.assign(Object.assign({}, accessCard), { qrData: qrImage }),
            summary: {
                totalPayments: allPayments.length,
                totalAmount: totalAmount,
                historyUrl: historyUrl
            }
        });
    }
    catch (err) {
        console.error('Erreur creation paiement:', err);
        next(new ApiError_1.ApiError(500, 'Failed to create payment and card'));
    }
});
exports.createPayment = createPayment;
const getPaymentsByStudent = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { studentId } = req.query;
    if (!studentId) {
        return next(new ApiError_1.ApiError(400, 'Student ID is required'));
    }
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
        console.error('Erreur recuperation paiements:', err);
        next(new ApiError_1.ApiError(500, 'Failed to fetch payments'));
    }
});
exports.getPaymentsByStudent = getPaymentsByStudent;
const updatePaymentStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { paymentId } = req.params;
    const { status } = req.body;
    const validStatuses = ['PENDING', 'VALID', 'EXPIRED'];
    if (!validStatuses.includes(status)) {
        return next(new ApiError_1.ApiError(400, `Invalid status value. Must be one of: ${validStatuses.join(', ')}`));
    }
    try {
        const payment = yield db_1.default.payment.update({
            where: { id: paymentId },
            data: { status },
        });
        res.json({ success: true, payment });
    }
    catch (err) {
        console.error('Erreur mise a jour statut:', err);
        if (err.code === 'P2025') {
            return next(new ApiError_1.ApiError(404, 'Payment not found'));
        }
        next(new ApiError_1.ApiError(500, 'Failed to update payment status'));
    }
});
exports.updatePaymentStatus = updatePaymentStatus;
