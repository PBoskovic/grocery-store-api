import { Request, Response } from 'express';
import User from '../models/User';
import {AuthUser} from "../types/authuser";
import {canAccessTargetUser} from "../utils/canAccessTargetUser";
import {getDescendantNodeIds} from "../utils/getDescendantNodeIds";
import bcrypt from "bcryptjs";


// Get one user
export const getUser = async (req: Request, res: Response) => {
    const currentUser = req.user as AuthUser;
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
        res.status(404).json({error: 'User not found'});
        return;
    }

    if (!(await canAccessTargetUser(currentUser, targetUser))) {
        res.status(403).json({ error: 'Forbidden' });
        return
    }

    // Optionally omit password/hash
    const { password, ...data } = targetUser.toObject();
    res.json(data);
};

export const listUsers = async (req: Request, res: Response) => {
    const currentUser = req.user as AuthUser;
    const allowedNodeIds = await getDescendantNodeIds(currentUser.nodeId);

    let filter: any = { nodeId: { $in: allowedNodeIds } };

    // Enforce access control: who can see what
    if (currentUser.role === 'employee') {
        filter.role = 'employee';
    } else if (currentUser.role === 'manager') {
        filter.role = { $in: ['employee', 'manager'] };
    }

    // Extra filtering via query params (admin, manager)
    const { role } = req.query;
    if (role && ['employee', 'manager'].includes(role as string)) {
        // If currentUser is allowed to see this role, narrow further
        if (
            currentUser.role === 'admin' ||
            (currentUser.role === 'manager' && role === 'employee') ||
            (currentUser.role === 'manager' && role === 'manager')
        ) {
            filter.role = role;
        }
    }

    const users = await User.find(filter).select('-password');
    res.json(users);
};


export const createUser = async (req: Request, res: Response) => {
    const currentUser = req.user as AuthUser;
    if (!['admin', 'manager'].includes(currentUser.role)) {
        res.status(403).json({ error: 'Forbidden' });
        return;
    }

    // Validate node is in allowed subtree
    const allowedNodeIds = await getDescendantNodeIds(currentUser.nodeId);
    if (!allowedNodeIds.includes(req.body.nodeId)) {
        res.status(403).json({ error: 'Forbidden (invalid node)' });
        return;
    }

    // TODO: Hash password, validate fields, etc.
    const user = new User(req.body);
    await user.save();
    const { password, ...data } = user.toObject();
    res.status(201).json(data);
};


export const updateUser = async (req: Request, res: Response) => {
    const currentUser = req.user as AuthUser;
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
        res.status(404).json({ error: 'User not found' });
        return;
    }

    if (!(await canAccessTargetUser(currentUser, targetUser))) {
        res.status(403).json({ error: 'Forbidden' });
        return;
    }

    if (req.body.nodeId && currentUser.role === 'manager') {
        const allowedNodeIds = await getDescendantNodeIds(currentUser.nodeId);
        if (!allowedNodeIds.includes(req.body.nodeId)) {
            res.status(403).json({ error: 'Cannot assign user to node outside your scope' });
            return;
        }
    }


    Object.assign(targetUser, req.body);
    await targetUser.save();
    const { password, ...data } = targetUser.toObject();
    res.json(data);
};


export const deleteUser = async (req: Request, res: Response) => {
    const currentUser = req.user as AuthUser;
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
        res.status(404).json({ error: 'User not found' });
        return;
    }

    if (!(await canAccessTargetUser(currentUser, targetUser))) {
        res.status(403).json({ error: 'Forbidden' });
        return;
    }

    await targetUser.deleteOne();
    res.status(204).send();
};


export const changePassword = async (req: Request, res: Response) => {
    const currentUser = req.user as AuthUser;
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ error: 'User not found' });

    // Only allow user themselves, or admin, to change password
    if (currentUser.role !== 'admin' && currentUser.userId !== targetUser.id) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    // Require old password if user is not admin
    if (currentUser.role !== 'admin') {
        const { oldPassword, newPassword } = req.body;
        const valid = await bcrypt.compare(oldPassword, targetUser.password);
        if (!valid) return res.status(401).json({ error: 'Old password incorrect' });
        targetUser.password = newPassword;
    } else {
        targetUser.password = req.body.newPassword;
    }

    await targetUser.save();
    res.json({ success: true });
};

