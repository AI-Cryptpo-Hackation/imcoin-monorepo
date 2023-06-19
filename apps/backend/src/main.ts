import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { setupHyperObjects, SQLiteStore } from "@inaridiy/hyper-objects";
import dotenv from "dotenv";
import { Hono } from "hono";
import { cors } from 'hono/cors';
import { Server } from "socket.io";
import { Comment, Liver } from "./models";

dotenv.config();

await setupHyperObjects(new SQLiteStore("./db.sqlite"));
const app = new Hono();
const server = serve({
  fetch: app.fetch,
  port: 3001,
});
const io = new Server(server);
console.log("Server started at http://localhost:3001 (default)")

// TODO: CORSの設定が全く効かない！！！！なんで！！！！
app.use('/*', cors({
  origin: 'http://localhost:3000',
}));
app.use("/static/*", serveStatic({ root: "./" }));
app.get("/", (c) => c.text("Hello Node.js!"));
app.all("/teapot", (c) => c.text("I'm a teapot!", 418));

io.on("connection", async (socket) => {
  console.log('a user connected');
  socket.emit("history", await Comment.getHistorySnapshot());
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
