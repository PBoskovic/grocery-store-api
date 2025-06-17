import { getDescendantNodeIds } from './getDescendantNodeIds';
import { IUser } from '../models/User';
import { AuthUser } from "../types/authuser";

export async function canAccessTargetUser(currentUser: AuthUser, targetUser: IUser): Promise<boolean> {
    if (currentUser.role === 'admin') return true;
    const allowedNodeIds = await getDescendantNodeIds(currentUser.nodeId);
    if (currentUser.role === 'manager') {
        return (
            allowedNodeIds.includes(targetUser.nodeId.toString()) &&
            ['employee', 'manager'].includes(targetUser.role)
        );
    }
    if (currentUser.role === 'employee') {
        return (
            allowedNodeIds.includes(targetUser.nodeId.toString()) &&
            targetUser.role === 'employee'
        );
    }
    return false;
}
