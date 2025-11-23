import { NextFunction, Request, Response, RequestHandler } from "express";
import jwt, { Jwt } from 'jsonwebtoken';
import { User } from "./model/user";
import { JWT_SECRET } from "@repo/backend-common/config";



export const authMiddleware: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const token = authorization.split(' ')[1];
    if (!token) {
        res.status(403).json({ message: 'Unauthorized' });
        return;
    }
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    // @ts-ignore
    req.userId = decoded.userId;
    next();
}