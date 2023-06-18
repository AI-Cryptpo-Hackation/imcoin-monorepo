import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { setupHyperObjects, SQLiteStore } from "@inaridiy/hyper-objects";
import dotenv from "dotenv";
import { Hono } from "hono";
import { Server } from "socket.io";
import { Comment, Liver } from "./models";

dotenv.config();

await setupHyperObjects(new SQLiteStore("./db.sqlite"));
const app = new Hono();
const server = serve(app);
const io = new Server(server);

app.use("/static/*", serveStatic({ root: "./" }));
app.get("/", (c) => c.text("Hello Node.js!"));
app.all("/teapot", (c) => c.text("I'm a teapot!", 418));

io.on("connection", async (socket) => {
  socket.emit("history", await Comment.getHistorySnapshot());
  socket.on("send-comment", async (data) => {
    await Comment.send(data);
  });
  socket.on("ai-interact", async (data) => {
    const liverState = await Liver.execute();
    io.emit("liver-update", liverState.snapshot());
    console.log("Liver executed", liverState.snapshot());
  });
});

Comment.on("new", (comment) => {
  io.emit("comment", comment.snapshot());
});

const startLiver = async () => {
  const liverState = await Liver.execute();
  io.emit("liver-update", liverState.snapshot());

  const nextExecuteTime = Math.random() * 20 * 1000;

  setTimeout(startLiver, nextExecuteTime);
};

// startLiver();
