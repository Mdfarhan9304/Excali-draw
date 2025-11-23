import express, { Express } from "express";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../../../packages/db/.env") });

import { prismaClient } from "@repo/db/client";
import {
  CreateUserSchema,
  CreateRoomSchema,
  SigninSchema,
} from "@repo/common/types";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { authMiddleware } from "./middleware";

const app: Express = express();

const prisma = prismaClient;

app.use(express.json());

app.post("/api/signup", async (req, res) => {
  try {
    const parsedData = CreateUserSchema.safeParse(req.body);
    if (!parsedData.success) {
      res.status(400).json({ message: "Invalid data" });
      return;
    }
    const user = await prisma.user.create({
      data: {
        username: parsedData.data.username,
        email: parsedData.data.email,
        password: parsedData.data.password,
      },
    });
    res.status(201).json({ message: "User created successfully", user });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
});

app.post("/api/signin", async (req, res) => {
  try {
    const { username, password } = req.body;
    const validatedData = SigninSchema.safeParse({ username, password });
    if (!validatedData.success) {
      res.status(400).json({ message: "Invalid data" });
      return;
    }
    const user = await prisma.user.findFirst({
      where: {
        username: validatedData.data.username,
        password: validatedData.data.password,
      },
    });
    if (!user) {
      res.status(401).json({ message: "Invalid username or password" });
      return;
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    res.status(200).json({ message: "Signin successful", token });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
});

app.post("/api/room", authMiddleware, async (req, res) => {
  const parsedData = CreateRoomSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.json({
      message: "incorrect input",
    });
    return;
  }
  // @ts-ignore
  const userId = req.userId;
  try {
    const room = await prisma.room.create({
      data: {
        slug: parsedData.data.name,
        adminId: userId,
      },
    });
    res.json({
      message: "room created successfully",
      room: room,
    });
    return;
  } catch (error) {
    console.error(error);
    res.json({
      message: "internal server error",
    });
    return;
  }
});

app.get("/chats/:roomID", authMiddleware, async (req, res) => {
  try {
    const { roomID } = req.params;
    if (!roomID) {
      res.status(400).json({ message: "Room ID is required" });
      return;
    }
    const chats = await prisma.chat.findMany({
      where: {
        roomId: parseInt(roomID),

      },
      orderBy: {
        id: 'desc'
      },
      take: 1000
    });
    res.json({ chats });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
});

app.get("/room/:slug", async (req, res) => {
  const slug = req.params.slug;
  const room = await prismaClient.room.findFirst({
    where: {
      slug
    }
  });

  res.json({
    room
  })
})
app.listen(4000, () => {
  console.log("Server is running on port 4000");
});

export default app;
