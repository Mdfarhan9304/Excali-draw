import { WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "./config";



const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws, request) => {
  const url = request.url;
  if(!url){
    return;
  }
  const queryparams=new URLSearchParams(url.split('?')[1])
  const token= queryparams.get('token')
  if(!token){
    return;
  }
  const decoded=jwt.verify(token, JWT_SECRET) as JwtPayload
  if(!decoded.userId){
    ws.close()
    return;
  } 
  

  ws.on('message', function message(data){
    ws.send('pong')
  })

  
});

