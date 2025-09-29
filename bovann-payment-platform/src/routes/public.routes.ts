import { Router } from 'express';
import { publicVerifyCard } from '../controllers/publicVerification.controller';

const router = Router();

router.get('/verify-public', publicVerifyCard);

export default router;