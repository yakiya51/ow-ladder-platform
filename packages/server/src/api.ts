import express from "express";
import cors from "cors";
import cookies from "cookie-parser";
import { orpcHandler } from "./rpc/router";

export const api = express()
  .use(cors())
  .use(cookies())
  .use("/api{/*path}", async (req, res, next) => {
    const { matched } = await orpcHandler.handle(req, res, {
      prefix: "/api",
    });

    if (matched) return;

    next();
  });
