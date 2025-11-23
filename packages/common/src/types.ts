import { z } from "zod";

export const CreateUserSchema = z.object({
    username: z.string().min(3),
    email: z.email(),
    password: z.string()
});

export const SigninSchema = z.object({
    username: z.string().min(3),
    password: z.string().min(8),
});

export const CreateRoomSchema = z.object({
    name: z.string(),
});

