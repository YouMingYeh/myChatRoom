import http from "http";
import express from "express";
import dotenv from "dotenv-defaults";
import mongoose from "mongoose";
import WebSocket from "ws";
import mongo from "./mongo";
import wsConnect from "./wsConnect";
import { v4 as uuid } from 'uuid';
import cors from 'cors';
import path from 'path';
mongo.connect();

const app = express();
if (process.env.NODE_ENV === "production") {
  const __dirname = path.resolve();
  app.use(express.static(path.join(__dirname, "../frontend", "build")));
  app.get("/*", function (req, res) {
    res.sendFile(path.join(__dirname, "../frontend", "build", "index.html"));
  });
}

if (process.env.NODE_ENV === "development") {
	app.use(cors());
}

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const db = mongoose.connection;
db.once("open", () => {
  console.log("MongoDB connected!");
  wss.on("connection", (ws) => {
    wss.id = uuid()
    ws.box = "";
    ws.onmessage = wsConnect.onMessage(wss, ws);
    
    ws.onclose = wsConnect.onClose(wss, ws); 
  }); 
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
