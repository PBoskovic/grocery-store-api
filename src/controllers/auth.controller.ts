import { Request, Response } from 'express';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import { signJwt } from '../utils/jwt';

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        const token = signJwt({ userId: user._id, role: user.role, nodeId: user.nodeId });
        res.json({
            token,
            user: { _id: user._id, name: user.name, email: user.email, role: user.role, nodeId: user.nodeId }
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};
