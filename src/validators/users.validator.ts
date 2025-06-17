import { body } from 'express-validator';
import {User} from "../models";

const allowedRoles = ['manager', 'employee'];
export const createUserValidator = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
    body('role').isIn(allowedRoles).withMessage('Role must be one of: ' + allowedRoles.join(', ')),
    body('nodeId').isMongoId().withMessage('Valid nodeId is required'),
    body('email').custom(async (email) => {
        const exists = await User.findOne({ email });
        if (exists) {
            throw new Error('Email already in use');
        }
    }),
];

export const updateUserValidator = [
    body('name').optional().notEmpty(),
    body('email').optional().isEmail(),
    body('role').optional().isIn(allowedRoles).withMessage('Role must be one of: ' + allowedRoles.join(', ')),
    body('nodeId').optional().isMongoId(),
    body('email').custom(async (email) => {
        const exists = await User.findOne({ email });
        if (exists) {
            throw new Error('Email already in use');
        }
    }),
];
