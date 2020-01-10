const express = require("express");
const server = express();

server.use(express.json());
server.use(express.urlencoded({ extended: true }));

//Access Control Privileges
server.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

//Import and set paths for API versions
//api_v1
const apiv1 = require("./api/v1/api.js");
server.use("/api_v1", apiv1);
//api_v2
const apiv2 = require("./api/v2/api.js");
server.use("/api_v2", apiv2);
//api_v3
const apiv3 = require("./api/v3/apiRouter.js");
server.use("/api_v3", apiv3);
//api_v4
const apiv4 = require("./api/v4/apiRouter.js");
server.use("/api_v4", apiv4);
//api_v5
const apiv5 = require("./api/v5/apiRouter.js");
server.use("/api_v5", apiv5);

//Default Path
server.get("/", (req, res) => {
  res.status(200).json({ hello: `World!` });
});

module.exports = server;
