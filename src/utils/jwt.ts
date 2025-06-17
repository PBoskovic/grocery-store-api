import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export function signJwt(payload: string | Buffer | object, expiresIn?: string) {
    const exp = expiresIn || process.env.JWT_EXPIRES_IN || '2h';
    jwt.sign(payload, JWT_SECRET as jwt.Secret, { expiresIn: exp as any });
}

export function verifyJwt(token: string) {
    return jwt.verify(token, JWT_SECRET);
}
