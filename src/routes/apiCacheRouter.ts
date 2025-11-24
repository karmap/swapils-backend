import { Hono } from "hono";
import { SWAPI_PREFIX } from "../types/constants";

export const apiCacheRouter = new Hono<{ Bindings: Env }>();

apiCacheRouter.get("/list", async (c) => {
    const { keys } = await c.env.SWAPI_KV.list({ prefix: SWAPI_PREFIX });
    return c.json({
        count: keys.length,
        keys: keys.map((k) => k.name)
    });
});

apiCacheRouter.delete("/clear", async (c) => {
    const { keys } = await c.env.SWAPI_KV.list({ prefix: SWAPI_PREFIX });
    for (const { name } of keys) {
        await c.env.SWAPI_KV.delete(name);
    }
    return c.json({ deleted: keys.length });
});