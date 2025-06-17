import { AuthUser } from '../authuser';

declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
        }
    }
}
