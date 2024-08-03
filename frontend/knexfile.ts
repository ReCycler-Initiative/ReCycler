import type { Knex } from "knex";

const {
  POSTGRES_DB = "postgres",
  POSTGRES_USER = "postgres",
  POSTGRES_PASSWORD = "foobar",
  POSTGRES_HOST = "localhost",
  POSTGRES_PORT = "5434",
} = process.env;

const config: Knex.Config = {
  client: "postgresql",
  connection: {
    database: POSTGRES_DB,
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    host: POSTGRES_HOST,
    port: +POSTGRES_PORT,
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
