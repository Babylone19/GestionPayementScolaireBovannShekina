import { Router } from 'express';
import { publicVerifyCard } from '../controllers/publicVerification.controller';
import { getStudentHistory } from '../controllers/publicHistory.controller';

const router = Router();

router.get('/verify-public', publicVerifyCard);
router.get('/student-history/:studentId', getStudentHistory); // Cette ligne doit exister

export default router;