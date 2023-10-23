# chat-app

I created this to learn the WebSocket protocol, and gain experience with React, Typescript, and Elysia.

Built to be extensible, and easy to add new features down the road.

To install dependencies:

```bash
bun install
```

To run locally:

```bash
bun dev
```

This is a Typescript monorepo containing two packages:

## server

An ephemeral chat app built with [Elysia](https://elysiajs.com/), a type-safe express-like web framework for [Bun](https://bun.sh/)
using [drizzle](https://orm.drizzle.team) to store and query data from a SQLite database.

Custom-built authentication that hashes passwords with bcrypt and uses JWTs for authorization.

## client

React app built with [Vite](https://vitejs.dev/).

State management with [Zustand](https://github.com/pmndrs/zustand).
