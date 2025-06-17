import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import {pickFields} from "../utils/pickFields";

export function validateRequest(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    next();
}

export function filterBody(allowedFields: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        req.body = pickFields(req.body, allowedFields);
        next();
    };
}
