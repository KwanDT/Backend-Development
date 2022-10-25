import * as pg from "pg";
const { Pool } = pg.default;
// const { Pool } = require('pg')

// const pool = new Pool({
//   connectionString: "postgresql://postgres:1999.8/@localhost:5432/posts",
// });

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "posts",
  password: "1999.8/",
  port: 5432,
});

export { pool };
