import { Request, Response, NextFunction } from 'express';
import {JsonWebTokenError, NotBeforeError, TokenExpiredError} from 'jsonwebtoken';
import { verifyJwt} from "../utils/jwt";


export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'No token provided' });
        return;
    }
    const token = authHeader.replace('Bearer ', '');

    try {
        const decoded = verifyJwt(token);
        if (!decoded) {
            res.status(401).json({ error: 'Invalid token' });
            return;
        }
        req.user = decoded;
        next();
    } catch (err) {
        if (err instanceof TokenExpiredError) {
            res.status(401).json({ error: 'Token expired' });
            return;
        }
        if (err instanceof JsonWebTokenError) {
            res.status(401).json({ error: 'Invalid token' });
            return;
        }
        if (err instanceof NotBeforeError) {
            res.status(401).json({ error: 'Token not active' });
            return;
        }
        res.status(401).json({ error: 'Authentication failed' });
        return;
    }
}