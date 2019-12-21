const express = require("express");
const router = express.Router();

//I can reserve paths that will override the default model
router.get("/RESERVED", (req, res)=>{res.send("RESERVED")});

//paths for film_actor table
const filmActorModel = require("./models/filmActorModel");
//for actor to film
router.use("/actor/:id/film",function(req, res, next) {
    req.actorId = req.params.id;
    next()},filmActorModel);
//for film to actor
router.use("/film/:id/actor",function(req, res, next) {
    req.filmId = req.params.id;
    next()},filmActorModel);

//paths for film_category table
const filmCategoryModel = require("./models/filmCategoryModel");
//for actor to film
router.use("/category/:id/film",function(req, res, next) {
    req.catId = req.params.id;
    next()},filmCategoryModel);
//for film to actor
router.use("/film/:id/category",function(req, res, next) {
    req.filmId = req.params.id;
    next()},filmCategoryModel);

//Default Model if no specific path defined in api
const model = require("./defaultModel");
router.use("/",model);

module.exports = router;