# Cauldron of Answers

A realtime multiplayer party game. An 8-bit witch asks the coven a question, everyone tosses an answer into her cauldron, the cauldron flings the answers back out, and the room votes on the best one. Points go on the leaderboard.

## How it plays

1. Enter your name and create a named room. Copy the invite link and send it to friends.
2. The host writes a question. Smoke rises and the witch reveals it to everyone.
3. Every player answers. When all answers are in, voting starts automatically.
4. Vote for your favourite (not your own). Each vote received is worth 100 points.
5. The host starts the next round.

## Stack

- `public/index.html` — the whole game: pixel-art canvas scene, UI, and a tiny network adapter.
- `src/index.js` — a Cloudflare Worker serving the static page, plus a `Room` Durable Object per room code. Room state is one JSON document persisted in Durable Object storage; every write is broadcast to all WebSocket subscribers.

## Run locally

```sh
npm install
npm run dev
```

## Deploy

```sh
npx wrangler login
npm run deploy
```
