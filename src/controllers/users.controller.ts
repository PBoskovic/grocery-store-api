import { Request, Response } from 'express';
import User from '../models/User';
import {AuthUser} from "../types/authuser";
import {canAccessTargetUser} from "../utils/canAccessTargetUser";
import {getDescendantNodeIds} from "../utils/getDescendantNodeIds";


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
    if (currentUser.role === 'employee') {
        filter.role = 'employee';
    } else if (currentUser.role === 'manager') {
        filter.role = { $in: ['employee', 'manager'] };
    }
    // Admin: no role filter
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

    // Optionally restrict what fields can be changed
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
