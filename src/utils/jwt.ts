import jwt from 'jsonwebtoken';
import {AuthUser} from "../types/authuser";

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export function signJwt(payload: string | Buffer | object, expiresIn?: string) {
    const exp = expiresIn || process.env.JWT_EXPIRES_IN || '2h';
    return jwt.sign(payload, JWT_SECRET as jwt.Secret, { expiresIn: exp as any });
}

export function verifyJwt(token: string): AuthUser | null {
    try {
        return jwt.verify(token, JWT_SECRET) as AuthUser;
    } catch (err) {
        // Rethrow for specific error handling in middleware
        throw err;
    }
}
