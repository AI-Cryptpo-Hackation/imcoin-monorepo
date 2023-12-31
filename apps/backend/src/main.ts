import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { setupHyperObjects, SQLiteStore } from "@inaridiy/hyper-objects";
import dotenv from "dotenv";
import { Hono } from "hono";
import { cors } from 'hono/cors';
import { Server } from "socket.io";
import { Action, Comment, Liver } from "./models";

dotenv.config();

await setupHyperObjects(new SQLiteStore("./db.sqlite"));
const app = new Hono();
const server = serve({
  fetch: app.fetch,
  port: 3001,
});
const io = new Server(server, {
  cors: {
    origin: "*",
  }
});
console.log("Server started at http://localhost:3001 (default)")

app.use('/*', cors({ origin: '*'}));
app.use("/static/*", serveStatic({ root: "./" }));
app.get("/", (c) => c.text("Hello Node.js!"));
app.all("/teapot", (c) => c.text("I'm a teapot!", 418));

io.on("connection", async (socket) => {
  console.log('a user connected');
  socket.emit("history", await Comment.getHistorySnapshot());
  socket.emit("action-history", await Action.getHistorySnapshot());
  socket.on("send-comment", async (data) => {
    await Comment.send(data);
  });
  socket.on("ai-interact", async () => {
    await Liver.execute();
  });
});

Comment.on("new", (comment) => {
  io.emit("comment", comment.snapshot());
});

Liver.on("new", (liver) => {
  io.emit("liver-update", liver.snapshot());
});

Action.on("new", (action) => {
  io.emit("action", action.snapshot());
});