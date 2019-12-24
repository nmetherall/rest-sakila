const express = require("express");
const router = express.Router();

//I can reserve paths that will override the default model
router.get("/RESERVED", (req, res) => {
  res.send("RESERVED");
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
