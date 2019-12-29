const express = require("express");
const router = express.Router();

//Default message
router.get("/", (req, res) => {
  res.status(200).send("Hello! Welcome to api_v2");
});

//I can reserve paths that will override the default model
router.get("/RESERVED", (req, res) => {
  res.status(200).send("RESERVED");
});

//generic bridge table model
const bridgeTableModel = require("./models/bridgeTableModel");
router.use(
  "/:baseTable/:baseId/:targetTable",
  (req, res, next) => {
    req.baseTable = req.params.baseTable;
    req.baseId = req.params.baseId;
    req.targetTable = req.params.targetTable;
    next();
  },
  bridgeTableModel
);

//Default Model if no specific path defined in api
const model = require("./models/defaultModel");
router.use("/", model);

module.exports = router;
