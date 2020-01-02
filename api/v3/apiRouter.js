const express = require("express");
const router = express.Router();

const mysqlConnection = require("../../mysqlConnection");
let tables = mysqlConnection.tables;

//Default message
router.get("/", (req, res) => {
  res.status(200).send("Hello! Welcome to api_v3");
});

//Default message
router.get("/_tables", (req, res) => {
  res.status(200).send(tables);
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

router.route("/:baseTable/:baseId/:targetTable")
  .get()
  .post();
router.route("/:baseTable/:baseId/:targetTable/:targetId")
  .get()
  .delete()
  .put();

//Default Model if no specific path defined in api
const defaultModel = require("./models/defaultModel");

router.route("/:table")
  .get(defaultModel.getAll)
  .post(defaultModel.post);
  
router.route("/:table/:id")
  .get(defaultModel.get)
  .put(defaultModel.put)
  .delete(defaultModel.delete);

module.exports = router;
