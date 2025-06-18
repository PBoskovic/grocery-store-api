import mongoose from 'mongoose';
import request from 'supertest';
import '../setup';
import app from '../../src/app'; // Make sure this is a default export!
import { seedTestData, loginTestUser } from '../testUtils';
import {OrgNode, User} from "../../src/models";

interface TestUser {
    _id: string;
    name: string;
    email: string;
    role: string;
    nodeId: string;
}

describe('User Routes', () => {
    let adminToken: string;
    let managerToken: string;

    beforeEach(async () => {

        await seedTestData();
        adminToken = await loginTestUser('admin@example.com', 'password');
        managerToken = await loginTestUser('vojvodina.manager@example.com', 'password');
    });

    it('Rejects unauthenticated requests with 401', async () => {
        const res = await request(app)
            .get('/api/users')
            .expect(401);

        expect(res.body.error).toBeDefined();
    });


    it('Admin can fetch all users', async () => {
        const res = await request(app)
            .get('/api/users')
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(3);
        // Optionally check structure
        expect(res.body[0]).toHaveProperty('name');
        expect(res.body[0]).not.toHaveProperty('password');
    });

    it('Manager can fetch employees and managers in their subtree', async () => {
        const res = await request(app)
            .get('/api/users')
            .set('Authorization', `Bearer ${managerToken}`)
            .expect(200);


        // Should only contain users from their own node or descendants
        expect(res.body.every((u: TestUser) =>
            ['manager', 'employee'].includes(u.role)
        )).toBe(true);
    });

    it('Manager only sees users in their own subtree, not in other branches', async () => {
        const managerToken = await loginTestUser('vojvodina.manager@example.com', 'password');
        const res = await request(app)
            .get('/api/users')
            .set('Authorization', `Bearer ${managerToken}`)
            .expect(200);

        const outOfScopeUser = await User.findOne({ email: 'bezanija.employee@example.com' });
        if (!outOfScopeUser) throw new Error('No out-of-scope user in test seed data');
        const outOfScopeUserId = (outOfScopeUser._id as mongoose.Types.ObjectId).toString();
        expect(res.body.some((u: TestUser) => u._id === outOfScopeUserId)).toBe(false);
    });

    it('Employee can only fetch employees in their subtree', async () => {
        // Assume 'subtreeEmployee' is an employee somewhere in the tree
        const employeeToken = await loginTestUser('store1.employee@example.com', 'password');
        const res = await request(app)
            .get('/api/users')
            .set('Authorization', `Bearer ${employeeToken}`)
            .expect(200);

        // All returned users should have role === 'employee'
        expect(res.body.every((u: TestUser) => u.role === 'employee')).toBe(true);

    });

    it('Admin can create a manager', async () => {
        const adminToken = await loginTestUser('admin@example.com', 'password');
        const node = await OrgNode.findOne({ name: 'Vojvodina' });
        if (!node) throw new Error('Node not found');
        const nodeId = (node._id as mongoose.Types.ObjectId).toString();
        const res = await request(app)
            .post('/api/users')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'New Manager',
                email: 'new.manager@example.com',
                password: 'password',
                role: 'manager',
                nodeId: nodeId
            })
            .expect(201);

        expect(res.body).toHaveProperty('_id');
        expect(res.body.role).toBe('manager');
        expect(res.body.name).toBe('New Manager');
    });

    it('Rejects creating a user with invalid email', async () => {
        const adminToken = await loginTestUser('admin@example.com', 'password');
        const node = await OrgNode.findOne({ name: 'Vojvodina' });
        await request(app)
            .post('/api/users')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Bad Email',
                email: 'not-an-email',
                password: 'password',
                role: 'employee',
                nodeId: (node!._id as mongoose.Types.ObjectId).toString()
            })
            .expect(400); // or whatever your validation returns
    });

    it('Manager cannot assign user to node outside their scope', async () => {
        const managerToken = await loginTestUser('vojvodina.manager@example.com', 'password');
        const targetUser = await User.findOne({ email: 'bezanija.employee@example.com' });
        const outOfTreeNode = await OrgNode.findOne({ name: 'Radnja 2' }); // Assume Radnja 2 not in manager tree
        if (!outOfTreeNode) throw new Error('Node not found');
        const nodeId = (outOfTreeNode._id as mongoose.Types.ObjectId).toString();

        const res = await request(app)
            .put(`/api/users/${targetUser?._id}`)
            .set('Authorization', `Bearer ${managerToken}`)
            .send({ nodeId: nodeId })
            .expect(403);

        expect(res.body).toHaveProperty('error');
    });

    it('Admin can delete a user', async () => {
        const adminToken = await loginTestUser('admin@example.com', 'password');
        const targetUser = await User.findOne({ email: 'bezanija.employee@example.com' });

        await request(app)
            .delete(`/api/users/${targetUser?._id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(204);

        // Confirm user deleted from DB
        const deleted = await User.findById(targetUser?._id);
        expect(deleted).toBeNull();
    });

    it('Admin can update a user\'s name and email', async () => {
        const adminToken = await loginTestUser('admin@example.com', 'password');
        const user = await User.findOne({ email: 'bezanija.employee@example.com' });
        const res = await request(app)
            .put(`/api/users/${user?._id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'Updated Name', email: 'updated.email@example.com' })
            .expect(200);
        expect(res.body.name).toBe('Updated Name');
        expect(res.body.email).toBe('updated.email@example.com');
    });

    it('Manager cannot update users outside their subtree', async () => {
        const managerToken = await loginTestUser('vojvodina.manager@example.com', 'password');
        const user = await User.findOne({ email: 'bezanija.employee@example.com' }); // out of subtree
        await request(app)
            .put(`/api/users/${user?._id}`)
            .set('Authorization', `Bearer ${managerToken}`)
            .send({ name: 'Should Not Update' })
            .expect(403);
    });


    it('Rejects updating user with invalid email', async () => {
        const adminToken = await loginTestUser('admin@example.com', 'password');
        const user = await User.findOne({ email: 'bezanija.employee@example.com' });

        await request(app)
            .put(`/api/users/${user?._id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ email: 'not-an-email' })
            .expect(400); // Fails validation
    });

    it('Rejects updating user with empty name', async () => {
        const adminToken = await loginTestUser('admin@example.com', 'password');
        const user = await User.findOne({ email: 'bezanija.employee@example.com' });

        await request(app)
            .put(`/api/users/${user?._id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: '' }) // Name can't be blank
            .expect(400);
    });

});
