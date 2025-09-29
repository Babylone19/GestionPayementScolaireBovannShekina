import { body } from 'express-validator';

export const createStudentValidation = [
  body('lastName').notEmpty().withMessage('Nom obligatoire'),
  body('firstName').notEmpty().withMessage('Prénom obligatoire'),
  body('institution').notEmpty().withMessage('Établissement obligatoire'),
  body('studyLevel')
    .isIn(['BEPC', 'PROBATOIRE', 'BAC', 'LICENCE', 'MASTER', 'DOCTORAT'])
    .withMessage('Niveau d\'étude invalide'),
  body('profession').notEmpty().withMessage('Profession obligatoire'),
  body('phone')
    .matches(/^\+?[1-9]\d{0,14}$/)
    .withMessage('Numéro de téléphone invalide'),
  body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
  // NOUVELLES VALIDATIONS
  body('domain')
    .isIn(['GENIE_INFORMATIQUE', 'MULTIMEDIA_MARKETING_DIGITAL', 'CREATION_SITE_DEVELOPPEMENT_LOGICIEL'])
    .withMessage('Domaine de formation invalide'),
  body('infoChannel')
    .isIn(['TIKTOK', 'FACEBOOK', 'INSTAGRAM', 'LINKEDIN', 'WHATSAPP', 'AUTRE'])
    .withMessage('Canal d\'information invalide'),
];