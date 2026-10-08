// Vitest runs outside the React Server Components graph, where the real
// `server-only` package throws on import. Server modules stay testable via this no-op alias.
export {};
