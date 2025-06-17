import { connectMongo, disconnectMongo } from '../config/mongoose';
import OrgNode from '../models/OrgNode';
import User from '../models/User';
import bcrypt from 'bcryptjs';

import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/grocery-store';


async function seed() {
    await connectMongo(MONGODB_URI);
    await OrgNode.deleteMany({});
    await User.deleteMany({});

    // Helper to create nodes by name, type, and parent
    const nodes: Record<string, any> = {};

    nodes['Srbija'] = await new OrgNode({ name: 'Srbija', type: 'office', parentId: null }).save();

    nodes['Vojvodina'] = await new OrgNode({ name: 'Vojvodina', type: 'office', parentId: nodes['Srbija']._id }).save();

    nodes['Severnobački okrug'] = await new OrgNode({ name: 'Severnobački okrug', type: 'office', parentId: nodes['Vojvodina']._id }).save();
    nodes['Subotica'] = await new OrgNode({ name: 'Subotica', type: 'office', parentId: nodes['Severnobački okrug']._id }).save();
    nodes['Radnja 1'] = await new OrgNode({ name: 'Radnja 1', type: 'store', parentId: nodes['Subotica']._id }).save();

    nodes['Južnobački okrug'] = await new OrgNode({ name: 'Južnobački okrug', type: 'office', parentId: nodes['Vojvodina']._id }).save();
    nodes['Novi Sad'] = await new OrgNode({ name: 'Novi Sad', type: 'office', parentId: nodes['Južnobački okrug']._id }).save();
    nodes['Detelinara'] = await new OrgNode({ name: 'Detelinara', type: 'office', parentId: nodes['Novi Sad']._id }).save();
    nodes['Radnja 2'] = await new OrgNode({ name: 'Radnja 2', type: 'store', parentId: nodes['Detelinara']._id }).save();
    nodes['Radnja 3'] = await new OrgNode({ name: 'Radnja 3', type: 'store', parentId: nodes['Detelinara']._id }).save();

    nodes['Liman'] = await new OrgNode({ name: 'Liman', type: 'office', parentId: nodes['Novi Sad']._id }).save();
    nodes['Radnja 4'] = await new OrgNode({ name: 'Radnja 4', type: 'store', parentId: nodes['Liman']._id }).save();
    nodes['Radnja 5'] = await new OrgNode({ name: 'Radnja 5', type: 'store', parentId: nodes['Liman']._id }).save();


    nodes['Grad Beograd'] = await new OrgNode({ name: 'Grad Beograd', type: 'office', parentId: nodes['Srbija']._id }).save();
    nodes['Novi Beograd'] = await new OrgNode({ name: 'Novi Beograd', type: 'office', parentId: nodes['Grad Beograd']._id }).save();
    nodes['Bežanija'] = await new OrgNode({ name: 'Bežanija', type: 'office', parentId: nodes['Novi Beograd']._id }).save();
    nodes['Radnja 6'] = await new OrgNode({ name: 'Radnja 6', type: 'store', parentId: nodes['Bežanija']._id }).save();

    nodes['Vračar'] = await new OrgNode({ name: 'Vračar', type: 'office', parentId: nodes['Grad Beograd']._id }).save();
    nodes['Neimar'] = await new OrgNode({ name: 'Neimar', type: 'office', parentId: nodes['Vračar']._id }).save();
    nodes['Radnja 7'] = await new OrgNode({ name: 'Radnja 7', type: 'store', parentId: nodes['Neimar']._id }).save();

    nodes['Crveni krst'] = await new OrgNode({ name: 'Crveni krst', type: 'office', parentId: nodes['Vračar']._id }).save();
    nodes['Radnja 8'] = await new OrgNode({ name: 'Radnja 8', type: 'store', parentId: nodes['Crveni krst']._id }).save();
    nodes['Radnja 9'] = await new OrgNode({ name: 'Radnja 9', type: 'store', parentId: nodes['Crveni krst']._id }).save();

    // Create users: a manager and employee at several nodes
    const password = await bcrypt.hash('password123', 10);

    // Managers at high-level nodes
    await new User({ email: 'vojvodina.manager@example.com', name: 'Manager Vojvodina', password, role: 'manager', nodeId: nodes['Vojvodina']._id }).save();
    await new User({ email: 'beograd.manager@example.com', name: 'Manager Beograd', password, role: 'manager', nodeId: nodes['Grad Beograd']._id }).save();
    await new User({ email: 'novisad.manager@example.com', name: 'Manager Novi Sad', password, role: 'manager', nodeId: nodes['Novi Sad']._id }).save();

    // Employees at selected stores
    await new User({ email: 'radnja1.employee@example.com', name: 'Employee Radnja 1', password, role: 'employee', nodeId: nodes['Radnja 1']._id }).save();
    await new User({ email: 'radnja4.employee@example.com', name: 'Employee Radnja 4', password, role: 'employee', nodeId: nodes['Radnja 4']._id }).save();
    await new User({ email: 'radnja9.employee@example.com', name: 'Employee Radnja 9', password, role: 'employee', nodeId: nodes['Radnja 9']._id }).save();

    console.log('Seeded organizational tree and demo users as per the diagram!');
    await disconnectMongo();
}

seed().catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
});
