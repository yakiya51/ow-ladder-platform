import express from "express";
import cors from "cors";
import cookies from "cookie-parser";
import { handleBNetOauthCallback } from "./oauth";
import { rpcHandler } from "./rpc/router";

// OAuth callback handler is not part of RPC layer
// so it is directly handled as a GET endpoint.
// All RPC procedures are handled at /api/*
export const api = express()
  .use(cors({ origin: true, credentials: true }))
  .use(cookies())
  .get("/api/auth/bnet/callback", handleBNetOauthCallback)
  .use("/api{/*path}", async (req, res, next) => {
    const { matched } = await rpcHandler.handle(req, res, {
      prefix: "/api",
    });

    if (matched) return;

    next();
  });
