import type { Knex } from "knex";

const {
  POSTGRES_DATABASE = "postgres",
  POSTGRES_USER = "postgres",
  POSTGRES_PASSWORD = "foobar",
  POSTGRES_HOST = "localhost",
  POSTGRES_PORT = "5433",
} = process.env;

const config: Knex.Config = {
  client: "postgresql",
  connection: {
    database: POSTGRES_DATABASE,
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    host: POSTGRES_HOST,
    port: +POSTGRES_PORT,
    ssl: POSTGRES_HOST !== "localhost",
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    tableName: "knex_migrations",
  },
};

export default config;
