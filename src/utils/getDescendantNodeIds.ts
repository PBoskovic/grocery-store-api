import OrgNode, { IOrgNode } from '../models/OrgNode';
import mongoose from 'mongoose';

export async function getDescendantNodeIds(nodeId: string | mongoose.Types.ObjectId): Promise<string[]> {
    // If it is a string, cast to ObjectId
    const objId = typeof nodeId === 'string' ? new mongoose.Types.ObjectId(nodeId) : nodeId;
    const startNode = await OrgNode.findById(objId);
    if (!startNode) return [];

    const ids: string[] = [];
    async function traverse(node: IOrgNode): Promise<void> {
        ids.push((node._id as mongoose.Types.ObjectId).toString());
        // Find children
        const children = await OrgNode.find({ parentId: node._id });
        for (const child of children) {
            await traverse(child);
        }
    }
    await traverse(startNode);
    return ids;
}