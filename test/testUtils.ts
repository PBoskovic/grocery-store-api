import User, {IUser} from '../src/models/User';         // adjust the path if needed
import OrgNode, {IOrgNode} from '../src/models/OrgNode';
import request from 'supertest';
import app from '../src/app';                  // your Express app

// Types for easy reference
interface SeededUsers {
    admin: IUser,
    managerVojvodina: IUser,
    managerBezanija: IUser,
    employeeStore1: IUser,
    employeeStore2: IUser,
    employeeBezanija: IUser
}
interface SeededNodes {
    srbija: IOrgNode,
    vojvodina: IOrgNode,
    bezanija: IOrgNode,
    store1: IOrgNode,
    store2: IOrgNode
}

export async function seedTestData(): Promise<{ users: SeededUsers, nodes: SeededNodes }> {
    const srbija = await OrgNode.create({ name: 'Srbija', type: 'office', parentId: null });
    const vojvodina = await OrgNode.create({ name: 'Vojvodina', type: 'office', parentId: srbija._id });
    const bezanija = await OrgNode.create({ name: 'Bezanija', type: 'office', parentId: srbija._id });
    const store1 = await OrgNode.create({ name: 'Radnja 1', type: 'store', parentId: vojvodina._id });
    const store2 = await OrgNode.create({ name: 'Radnja 2', type: 'store', parentId: bezanija._id });

    const admin = await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password',
        role: 'admin',
        nodeId: srbija._id
    });
    const managerVojvodina = await User.create({
        name: 'Manager Vojvodina',
        email: 'vojvodina.manager@example.com',
        password: 'password',
        role: 'manager',
        nodeId: vojvodina._id
    });
    const managerBezanija = await User.create({
        name: 'Manager Bezanija',
        email: 'bezanija.manager@example.com',
        password: 'password',
        role: 'manager',
        nodeId: bezanija._id
    });

    const employeeBezanija = await User.create({
        name: 'Employee Bezanija',
        email: 'bezanija.employee@example.com',
        password: 'password',
        role: 'employee',
        nodeId: bezanija._id
    });

    const employeeStore1 = await User.create({
        name: 'Employee Store 1',
        email: 'store1.employee@example.com',
        password: 'password',
        role: 'employee',
        nodeId: store1._id
    });
    const employeeStore2 = await User.create({
        name: 'Employee Store 2',
        email: 'store2.employee@example.com',
        password: 'password',
        role: 'employee',
        nodeId: store2._id
    });

    return {
        users: { admin, managerVojvodina, managerBezanija, employeeStore1, employeeStore2, employeeBezanija },
        nodes: { srbija, vojvodina, bezanija, store1, store2 }
    };
}

// Helper: Login and return JWT token
export async function loginTestUser(email: string, password: string): Promise<string> {
    const res = await request(app)
        .post('/api/auth/login')
        .send({ email, password })
        .expect(200);

    return res.body.token;
}
