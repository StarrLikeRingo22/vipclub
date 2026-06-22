// DEPRECATED: the data layer now runs on Neon (Postgres) via lib/sql.ts.
// This file remains only as a backwards-compatibility shim so any stray import
// keeps compiling. Prefer importing from "./sql".
export { isDbConfigured as isSupabaseConfigured } from "./sql";
