import mongoose, { Schema, Document } from 'mongoose';

export type OrgNodeType = 'office' | 'store';

export interface IOrgNode extends Document {
    name: string;
    type: OrgNodeType;
    parentId?: mongoose.Types.ObjectId | null;
    children?: mongoose.Types.ObjectId[];
}

const OrgNodeSchema = new Schema<IOrgNode>({
    name: { type: String, required: true },
    type: { type: String, enum: ['office', 'store'], required: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'OrgNode', default: null },
    children: [{ type: Schema.Types.ObjectId, ref: 'OrgNode' }]
});

export default mongoose.model<IOrgNode>('OrgNode', OrgNodeSchema);
