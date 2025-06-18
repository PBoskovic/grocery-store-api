import { AuthUser } from '../types/authuser';
import { getDescendantNodeIds } from './getDescendantNodeIds';

export async function getPermittedNodeIds(currentUser: AuthUser): Promise<string[]> {
    // Admin can access all nodes (or just skip filter)
    if (currentUser.role === 'admin') return [];

    // Manager/Employee can access their node + descendants
    return await getDescendantNodeIds(currentUser.nodeId);
}
