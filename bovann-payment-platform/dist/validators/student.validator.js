"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStudentValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createStudentValidation = [
    (0, express_validator_1.body)('lastName').notEmpty().withMessage('Nom obligatoire'),
    (0, express_validator_1.body)('firstName').notEmpty().withMessage('Prénom obligatoire'),
    (0, express_validator_1.body)('institution').notEmpty().withMessage('Établissement obligatoire'),
    (0, express_validator_1.body)('studyLevel')
        .isIn(['BEPC', 'PROBATOIRE', 'BAC', 'LICENCE', 'MASTER', 'DOCTORAT'])
        .withMessage('Niveau d\'étude invalide'),
    (0, express_validator_1.body)('profession').notEmpty().withMessage('Profession obligatoire'),
    (0, express_validator_1.body)('phone')
        .matches(/^\+?[1-9]\d{0,14}$/)
        .withMessage('Numéro de téléphone invalide'),
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Email invalide'),
    // NOUVELLES VALIDATIONS
    (0, express_validator_1.body)('domain')
        .isIn(['GENIE_INFORMATIQUE', 'MULTIMEDIA_MARKETING_DIGITAL', 'CREATION_SITE_DEVELOPPEMENT_LOGICIEL'])
        .withMessage('Domaine de formation invalide'),
    (0, express_validator_1.body)('infoChannel')
        .isIn(['TIKTOK', 'FACEBOOK', 'INSTAGRAM', 'LINKEDIN', 'WHATSAPP', 'AUTRE'])
        .withMessage('Canal d\'information invalide'),
];
