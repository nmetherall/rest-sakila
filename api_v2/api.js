const express = require("express");
const router = express.Router();

//I can reserve paths that will override the default model
router.get("/RESERVED", (req, res) => {
  res.send("RESERVED");
});

//paths for film_actor table
const filmActorModel = require("./models/filmActorModel");
//for actor to film
router.use(
  "/actor/:id/film",
  (req, res, next) => {
    req.actorId = req.params.id;
    next();
  },
  filmActorModel
);
//for film to actor
router.use(
  "/film/:id/actor",
  (req, res, next) => {
    req.filmId = req.params.id;
    next();
  },
  filmActorModel
);

//paths for film_category table
const filmCategoryModel = require("./models/filmCategoryModel");
//for actor to film
router.use(
  "/category/:id/film",
  (req, res, next) => {
    req.catId = req.params.id;
    next();
  },
  filmCategoryModel
);
//for film to actor
router.use(
  "/film/:id/category",
  (req, res, next) => {
    req.filmId = req.params.id;
    next();
  },
  filmCategoryModel
);

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
const model = require("./defaultModel");
router.use("/", model);

module.exports = router;
