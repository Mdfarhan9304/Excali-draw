import { WebSocket, WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

interface User {
  ws: WebSocket;
  rooms: string[];
  userId: string;
}

function checkuser(token: string) {
  const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
  if (typeof decoded == "string") {
    return null;
  }
  if (!decoded || !decoded.userId) {
    return null;
  }
  return decoded.userId;
}

const wss = new WebSocketServer({ port: 8080 });

const rooms = [];
const users: User[] = [];
wss.on("connection", (ws: WebSocket, request) => {
  const url = request.url;
  if (!url) {
    return;
  }
  const queryparams = new URLSearchParams(url.split("?")[1]);
  const token = queryparams.get("token");
  if (!token) {
    return;
  }
  // const decoded=jwt.verify(token, JWT_SECRET) as JwtPayload
  // if(!decoded.userId){
  //   ws.close()
  //   return;
  // }
  const userId = checkuser(token);
  if (!userId) {
    ws.close();
    return;
  }
  users.push({
    userId,
    rooms: [],
    ws,
  });

  ws.on('message', (data) => {
    let parsedData;
    if (typeof data !== "string") {
      parsedData = JSON.parse(data.toString());
    } else {
      parsedData = JSON.parse(data); // {type: "join-room", roomId: 1}
    }

    const user = users.find((user) => user.userId === userId);
    if (!user) {
      return;
    }

    
    switch (parsedData.type) {
      case 'joinRoom':
        user.rooms.push(parsedData.payload.roomId);
        break;
      case 'leaveRoom':
        user.rooms = user.rooms.filter((room) => room !== parsedData.payload.roomId);
        break;
      case 'chat':
        const roomId = parsedData.payload.roomId;
        const message = parsedData.payload.message;
        users.forEach((user) => {
          if (user.rooms.includes(roomId)) {
            user.ws.send(JSON.stringify({
              type: 'chat',
              payload: {
                message: message,
                roomId: roomId
              }
            }));
          }
        });
        break;
    }
  });
});
