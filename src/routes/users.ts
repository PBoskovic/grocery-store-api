import {createUserValidator, updateUserValidator} from '../validators/users.validator';
import {filterBody, validateRequest} from '../middleware/validateRequest';
import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth';
import {
    getUser,
    listUsers,
    createUser,
    updateUser,
    deleteUser,
    changePassword,
} from '../controllers/users.controller';
import {asyncHandler} from "../utils/asyncHandler";

const router = Router();

router.use(authenticateJWT);

router.get('/', asyncHandler(listUsers));
router.get('/:id', asyncHandler(getUser));
router.post('/',
    createUserValidator,
    validateRequest,
    asyncHandler(createUser));
router.put('/:id',
    filterBody(['name', 'email', 'role', 'nodeId']),
    updateUserValidator,
    validateRequest,
    asyncHandler(updateUser));
router.delete('/:id', asyncHandler(deleteUser));
router.patch('/:id/password', asyncHandler(changePassword));

export default router;