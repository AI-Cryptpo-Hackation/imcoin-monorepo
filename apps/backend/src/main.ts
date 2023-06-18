import { serve } from "@hono/node-server";
import { setupHyperObjects, SQLiteStore } from "@inaridiy/hyper-objects";
import dotenv from "dotenv";
import { Hono } from "hono";

dotenv.config();

await setupHyperObjects(new SQLiteStore());

const app = new Hono();

app.get("/", (c) => c.text("Hello Node.js!"));
app.all("/teapot", (c) => c.text("I'm a teapot!", 418));

serve(app, (info) => console.info(`Server started on port ${info.port}`));
