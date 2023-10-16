# chat-app

Very much still a work in progress.

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

A chat app built with [Elysia](https://elysiajs.com/), a type-safe express-like web framework for [Bun](https://bun.sh/)
using [drizzle](https://orm.drizzle.team) to store and query data from a SQLite database.

## client

[ TBD ] React app built with [Vite](https://vitejs.dev/).
