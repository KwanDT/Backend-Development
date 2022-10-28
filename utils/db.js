import * as pg from "pg";
const { Pool } = pg.default;

const pool = new Pool({
  connectionString:
    "postgresql://postgres@localhost:5432/skill-checkpoint-2",
});

export { pool };
