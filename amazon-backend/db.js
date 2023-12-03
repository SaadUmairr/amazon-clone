const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const knexModule = require("knex");

const knex = knexModule({
    client: "mysql2",
    connection: {
        host: process.env.host,
        user: process.env.user,
        database: process.env.database,
        password: process.env.password,
    },
    pool: { min: 0, max: 7 },
});

module.exports = { knex };
