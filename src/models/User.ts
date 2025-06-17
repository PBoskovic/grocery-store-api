import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from "bcryptjs";

const saltRounds = 10;

export type UserRole = 'employee' | 'manager';

export interface IUser extends Document {
    email: string;
    password: string;
    name: string;
    role: UserRole;
    nodeId: mongoose.Types.ObjectId;
}

const UserSchema = new Schema<IUser>({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['employee', 'manager', 'admin'], required: true },
    nodeId: { type: Schema.Types.ObjectId, ref: 'OrgNode', required: true }
});

UserSchema.pre('save', async function (next) {
    // Only hash if password was changed, or on new user
    if (!this.isModified('password')) return next();

    try {
        const hash = await bcrypt.hash(this.password, saltRounds);
        this.password = hash;
        next();
    } catch (err) {
        next(err as any);
    }
});

export default mongoose.model<IUser>('User', UserSchema);
