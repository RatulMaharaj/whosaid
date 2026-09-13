// Who Said? — Cloudflare Worker + Durable Object backend.
// One Durable Object per room. State is a single JSON document; every
// change is broadcast to all WebSocket subscribers of that room.

const ROOM_RE = /^\/api\/rooms\/([A-Z0-9]{3,6})(\/ws)?$/;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const m = url.pathname.match(ROOM_RE);
    if (m) {
      const id = env.ROOMS.idFromName(m[1]);
      return env.ROOMS.get(id).fetch(request);
    }
    return env.ASSETS.fetch(request);
  },
};

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

function deepMerge(target, patch) {
  for (const [k, v] of Object.entries(patch)) {
    if (v && typeof v === "object" && !Array.isArray(v) && target[k] && typeof target[k] === "object" && !Array.isArray(target[k])) {
      deepMerge(target[k], v);
    } else {
      target[k] = v;
    }
  }
  return target;
}

export class Room {
  constructor(state, env) {
    this.ctx = state;
    this.env = env;
    this.state = undefined; // loaded lazily
  }

  async load() {
    if (this.state === undefined) this.state = (await this.ctx.storage.get("state")) ?? null;
    return this.state;
  }

  async save(next) {
    this.state = next;
    await this.ctx.storage.put("state", next);
    this.broadcast();
  }

  broadcast() {
    const msg = JSON.stringify({ type: "state", state: this.state });
    for (const ws of this.ctx.getWebSockets()) {
      try { ws.send(msg); } catch {}
    }
  }

  async fetch(request) {
    const url = new URL(request.url);
    const isWs = url.pathname.endsWith("/ws");
    await this.load();

    if (isWs) {
      if (request.headers.get("Upgrade") !== "websocket") return new Response("Expected websocket", { status: 426 });
      const pair = new WebSocketPair();
      this.ctx.acceptWebSocket(pair[1]);
      pair[1].send(JSON.stringify({ type: "state", state: this.state }));
      return new Response(null, { status: 101, webSocket: pair[0] });
    }

    if (request.method === "GET") {
      return this.state ? json({ exists: true, state: this.state }) : json({ exists: false }, 404);
    }
    if (request.method === "PUT") {
      const body = await request.json();
      if (!body || typeof body !== "object") return json({ error: "bad body" }, 400);
      if (url.searchParams.get("ifAbsent") === "1" && this.state) return json({ error: "exists" }, 409);
      await this.save(body);
      return json({ ok: true });
    }
    if (request.method === "PATCH") {
      if (!this.state) return json({ error: "no such room" }, 404);
      const body = await request.json();
      const next = deepMerge(structuredClone(this.state), body);
      await this.save(next);
      return json({ ok: true });
    }
    if (request.method === "DELETE") {
      await this.ctx.storage.deleteAll();
      this.state = null;
      this.broadcast();
      return json({ ok: true });
    }
    return json({ error: "method" }, 405);
  }

  async webSocketMessage(ws, msg) {
    if (msg === "ping") ws.send("pong");
  }
  async webSocketClose(ws) { try { ws.close(); } catch {} }
  async webSocketError(ws) { try { ws.close(); } catch {} }
}
