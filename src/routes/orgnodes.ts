import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth';
import { getEmployees, getManagers } from '../controllers/orgnodes.controller';
import {asyncHandler} from "../utils/asyncHandler";

const router = Router();
router.use(authenticateJWT);

/**
 * @openapi
 * /api/orgnodes/{id}/employees:
 *   get:
 *     summary: Get all employees for a node and its descendants.
 *     tags: [OrgNodes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the org node (office or store)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of employees for the node (and its descendants).
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id/employees', asyncHandler(getEmployees));

/**
 * @openapi
 * /api/orgnodes/{id}/managers:
 *   get:
 *     summary: Get all managers for a node and its descendants.
 *     tags: [OrgNodes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the org node (office or store)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of managers for the node (and its descendants).
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

router.get('/:id/managers', asyncHandler(getManagers));

export default router;