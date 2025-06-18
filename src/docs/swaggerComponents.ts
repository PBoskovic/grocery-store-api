/**
 * @openapi
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         role:
 *           type: string
 *           enum: [admin, manager, employee]
 *         nodeId:
 *           type: string
 *     UserCreate:
 *       type: object
 *       required: [name, email, password, role, nodeId]
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         role:
 *           type: string
 *           enum: [manager, employee]
 *         nodeId:
 *           type: string
 *     UserUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         role:
 *           type: string
 *           enum: [manager, employee]
 *         nodeId:
 *           type: string
 *   responses:
 *     Unauthorized:
 *       description: Authentication credentials are missing or invalid.
 *     Forbidden:
 *       description: You do not have permission to perform this action.
 *     NotFound:
 *       description: Resource not found.
 *     BadRequest:
 *       description: Validation failed or invalid data.
 */
