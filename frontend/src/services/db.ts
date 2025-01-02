import knex from "knex";
import knexfile from "../../knexfile";

let knexInstance: knex.Knex<any, unknown[]> | undefined;

if (!knexInstance) {
  knexInstance = knex(knexfile);
}

export default knexInstance!;
