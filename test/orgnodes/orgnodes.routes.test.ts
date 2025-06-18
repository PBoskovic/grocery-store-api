import request from 'supertest';
import '../setup';
import app from '../../src/app'; // Make sure this is a default export!
import { seedTestData, loginTestUser } from '../testUtils';
import {OrgNode} from "../../src/models";

interface TestUser {
    _id: string;
    name: string;
    email: string;
    role: string;
    nodeId: string;
}

describe('Orgnodes Routes', () => {
    let adminToken: string;
    let managerToken: string;

    beforeEach(async () => {

        await seedTestData();
        adminToken = await loginTestUser('admin@example.com', 'password');
        managerToken = await loginTestUser('vojvodina.manager@example.com', 'password');
    });

    it('Admin can fetch all employees for a node and its descendants', async () => {
        adminToken = await loginTestUser('admin@example.com', 'password');
        const node = await OrgNode.findOne({ name: 'Vojvodina' });
        if (!node) throw new Error('Node not found');
        const res = await request(app)
            .get(`/api/orgnodes/${node._id}/employees?recursive=true`)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.every((u: TestUser) => u.role === 'employee')).toBe(true);
    });

    it('Manager cannot fetch employees outside their subtree', async () => {
        managerToken = await loginTestUser('vojvodina.manager@example.com', 'password');
        const outOfScopeNode = await OrgNode.findOne({ name: 'Bezanija' }); // Assume Bezanija is NOT in their subtree
        if (!outOfScopeNode) throw new Error('Node not found');
        await request(app)
            .get(`/api/orgnodes/${outOfScopeNode._id}/employees?recursive=true`)
            .set('Authorization', `Bearer ${managerToken}`)
            .expect(403); // Forbidden for out-of-scope
    });

    it('Manager can fetch employees in their own subtree', async () => {
        managerToken = await loginTestUser('vojvodina.manager@example.com', 'password');
        const node = await OrgNode.findOne({ name: 'Vojvodina' }); // This node IS in subtree
        if (!node) throw new Error('Node not found');
        const res = await request(app)
            .get(`/api/orgnodes/${node._id}/employees?recursive=true`)
            .set('Authorization', `Bearer ${managerToken}`)
            .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.every((u: TestUser) => u.role === 'employee')).toBe(true);
    });

    it('Employee cannot fetch managers for any node', async () => {
        const employeeToken = await loginTestUser('store1.employee@example.com', 'password');
        const node = await OrgNode.findOne({ name: 'Vojvodina' });
        if (!node) throw new Error('Node not found');
        await request(app)
            .get(`/api/orgnodes/${node._id}/managers?recursive=true`)
            .set('Authorization', `Bearer ${employeeToken}`)
            .expect(403);
    });



    it('Employee can fetch employees only in their subtree', async () => {
        const employeeToken = await loginTestUser('store1.employee@example.com', 'password');
        const node = await OrgNode.findOne({ name: 'Radnja 1' });
        if (!node) throw new Error('Node not found');
        const res = await request(app)
            .get(`/api/orgnodes/${node._id}/employees?recursive=true`)
            .set('Authorization', `Bearer ${employeeToken}`)
            .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.every((u: TestUser) => u.role === 'employee')).toBe(true);
    });

});
