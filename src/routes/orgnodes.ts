import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth';
import { getEmployees, getManagers } from '../controllers/orgnodes.controller';
import {asyncHandler} from "../utils/asyncHandler";

const router = Router();
router.use(authenticateJWT);

router.get('/:id/employees', asyncHandler(getEmployees));
router.get('/:id/managers', asyncHandler(getManagers));

export default router;