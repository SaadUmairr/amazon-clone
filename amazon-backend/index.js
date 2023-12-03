const { ApolloServer } = require("apollo-server-express");
const {
    ApolloServerPluginDrainHttpServer,
    ApolloServerPluginLandingPageLocalDefault,
} = require("apollo-server-core");
const express = require("express");
const http = require("http");

const { mergeResolvers, mergeTypeDefs } = require("@graphql-tools/merge");
const { loadFilesSync } = require("@graphql-tools/load-files");
const path = require("path");
const { knex } = require("./db");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const cors = require("cors");
dotenv.config();

const resolverFiles = loadFilesSync(path.join(__dirname, "resolvers"));
const resolvers = mergeResolvers(resolverFiles);
const typeDefFiles = loadFilesSync(path.join(__dirname, "types"));
const typeDefs = mergeTypeDefs(typeDefFiles);

async function startApolloServer(typeDefs, resolvers) {
    const app = express();
    const httpServer = http.createServer(app);
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        csrfPrevention: true,
        cache: "bounded",
        plugins: [
            ApolloServerPluginDrainHttpServer({ httpServer }),
            ApolloServerPluginLandingPageLocalDefault({ embed: true }),
        ],
        context: ({ req }) => {
            try {
                const token = (
                    req.headers["authorization"] || "Bearer"
                ).replace("Bearer ", "");
                const user = jwt.verify(token, process.env.secret);
                return { knex, user };
            } catch (e) {}

            return { knex };
        },
    });

    await server.start();

    app.use(cors());

    server.applyMiddleware({ app });

    await new Promise((resolve) =>
        httpServer.listen({ port: process.env.PORT || 4008 }, resolve)
    );
    console.log(
        `🚀 Server ready at http://localhost:4008${server.graphqlPath}`
    );
}

startApolloServer(typeDefs, resolvers);
