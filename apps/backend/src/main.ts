import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { setupHyperObjects, SQLiteStore } from "@inaridiy/hyper-objects";
import dotenv from "dotenv";
import { Hono } from "hono";
import { Server } from "socket.io";

dotenv.config();

await setupHyperObjects(new SQLiteStore());
const app = new Hono();
const server = serve(app);
const io = new Server(server);

app.use("/static/*", serveStatic({ root: "./" }));
app.get("/", (c) => c.text("Hello Node.js!"));
app.all("/teapot", (c) => c.text("I'm a teapot!", 418));

io.on("connection", (socket) => {
  console.log("a user connected");
});
