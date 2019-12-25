const express = require("express");
const server = express();

const apiv1 = require("./api_v1/api.js");
const apiv2 = require("./api_v2/api.js");

server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.use("/api_v1", apiv1);
server.use("/api_v2", apiv2);

server.get("/", (req, res) => {
	res.status(200).json({ hello: `World!` });
});

server.get("/api_v1", (req, res) => {
	res.status(200).json({ hello: `This is my API` });
});

module.exports = server;
