import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'employee' | 'manager';

export interface IUser extends Document {
    email: string;
    passwordHash: string;
    name: string;
    role: UserRole;
    nodeId: mongoose.Types.ObjectId;
}

const UserSchema = new Schema<IUser>({
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['employee', 'manager'], required: true },
    nodeId: { type: Schema.Types.ObjectId, ref: 'OrgNode', required: true }
});

export default mongoose.model<IUser>('User', UserSchema);
