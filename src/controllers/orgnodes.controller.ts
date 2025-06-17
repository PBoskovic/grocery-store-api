import { Request, Response } from 'express';
import User from '../models/User';
import {getDescendantNodeIds} from "../utils/getDescendantNodeIds";
import {getPermittedNodeIds} from "../utils/access";
import {AuthUser} from "../types/authuser";

export const getEmployees = async (req: Request, res: Response) => {
  const currentUser = req.user as AuthUser;
  const nodeId = req.params.id;
  const includeDesc = req.query.desc === 'true';

  // Figure out which nodes this query should include
  let nodeIds = [nodeId];
  if (includeDesc) {
    nodeIds = await getDescendantNodeIds(nodeId);
  }

  // Get all nodes currentUser can see
  const permittedNodes = await getPermittedNodeIds(currentUser);

  if (currentUser.role !== 'admin') {
    // All requested nodes must be within permittedNodes
    if (!nodeIds.every(id => permittedNodes.includes(id))) {
      return res.status(403).json({ error: 'Forbidden: Node not in your scope' });
    }
  }

  const users = await User.find({
    nodeId: { $in: nodeIds },
    role: 'employee',
  }).select('-password');
  res.json(users);
};


export const getManagers = async (req: Request, res: Response) => {
  const currentUser = req.user as AuthUser;
  const nodeId = req.params.id;
  const includeDesc = req.query.desc === 'true';

  let nodeIds = [nodeId];
  if (includeDesc) {
    nodeIds = await getDescendantNodeIds(nodeId);
  }

  const permittedNodes = await getPermittedNodeIds(currentUser);

  if (currentUser.role !== 'admin') {
    if (!nodeIds.every(id => permittedNodes.includes(id))) {
      return res.status(403).json({ error: 'Forbidden: Node not in your scope' });
    }
  }

  // Only managers can see managers, or admin
  if (currentUser.role === 'employee') {
    return res.status(403).json({ error: 'Employees cannot view managers' });
  }

  const users = await User.find({
    nodeId: { $in: nodeIds },
    role: 'manager',
  }).select('-password');
  res.json(users);
};