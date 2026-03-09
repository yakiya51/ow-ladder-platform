import express from "express";
import cors from "cors";
import cookies from "cookie-parser";
import { orpcHandler } from "./router";

export const api = express()
  .use(cors())
  .use(cookies())
  .use("/api{/*path}", async (req, res, next) => {
    const { matched } = await orpcHandler.handle(req, res, {
      prefix: "/api",
      context: { cookies: req.cookies },
    });

    if (matched) return;

    next();
  });
