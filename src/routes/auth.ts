import { Router } from 'express';
import { login } from '../controllers/auth.controller';
import {asyncHandler} from "../utils/asyncHandler";
const router = Router();

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Log in and receive a JWT token.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 example: password
 *     responses:
 *       200:
 *         description: Successful login, returns JWT and user data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.post('/login', asyncHandler(login));

export default router;
