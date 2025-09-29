import { Router } from 'express';
import { verifyCard } from '../controllers/cardVerification.controller';

const router = Router();

router.get('/verify', verifyCard);

export default router;