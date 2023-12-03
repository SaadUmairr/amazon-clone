const jwt = require("jsonwebtoken");
const { AuthenticationError } = require("apollo-server-express");

module.exports = {
    Query: {},
    Mutation: {
        login: async (_, { email, password }, { knex }) => {
            if (!(await knex.schema.hasTable(user)))
                throw new AuthenticationError("User not found");
            const crew = await knex(user)
                .where({ password })
                .andWhere({ email })
                .first();
            if (!crew) throw new AuthenticationError("User not found");
            return jwt.sign({ crew }, process.env.secret, {
                expiresIn: "7 days",
            });
        },
    },
};
