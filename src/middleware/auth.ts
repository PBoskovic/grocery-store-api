import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import {AuthUser} from "../types/authuser";


const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';

export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }
    const token = authHeader.replace('Bearer ', '');
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
        (req as any).user = decoded; // Attach user to request
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}
