const express = require('express');
const router = express.Router();
const Pet = require("../models/petsModel");
const User = require("../models/usersModel");
const { body, validationResult } = require('express-validator');

// Get all acquired pets info
router.get("/", async function (req, res, next) {
    try {
        let userInfo = new User();
        userInfo.id = req.body.user_id;

        let result = await Pet.GetAllPets(userInfo);

        res.status(result.status).send(result.data);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

// Get current pet info
router.get("/current", async function (req, res, next) {
    try {
        let userInfo = new User();
        userInfo.id = req.body.user_id;

        let result = await Pet.GetCurrentPetInfo(userInfo);
        res.status(result.status).send(result.pet);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

// Add pet
router.post("/", async function (req, res, next) {
    try {
        let petInfo = new Pet();
        petInfo.id = req.body.pet_id;
        petInfo.user_id = req.body.user_id;

        let result = await Pet.AddPet(petInfo);
        res.status(result.status).send(result.data);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

// Change current pet
router.patch("/changeCurrent", async function (req, res, next) {
    try {
        let userInfo = new User();
        userInfo.id = req.body.user_id;

        let result = await Pet.ChangeCurrentPet(req.body.new_pet_id, userInfo);
        res.status(result.status).send(result.data);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

// Change pet's name
router.patch("/changeName", async function (req, res, next) {
    try {
        let petInfo = new Pet();
        petInfo.id = req.body.pet_id;
        petInfo.user_id = req.body.user_id;

        let result = await Pet.ChangeName(petInfo, req.body.newName);
        res.status(result.status).send(result.data);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

// Feed pet
router.patch("/feed", async function (req, res, next) {
    try {
        let result = await Pet.ChangeStats("Feed", req.body.user_id);
        res.status(result.status).send(result.data);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

// Bath pet
router.patch("/bath", async function (req, res, next) {
    try {
        let result = await Pet.ChangeStats("Bath", req.body.user_id);
        res.status(result.status).send(result.data);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

// Exercise pet
router.patch("/exercise", async function (req, res, next) {
    try {
        let result = await Pet.ChangeStats("Exercise", req.body.user_id);
        res.status(result.status).send(result.data);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

module.exports = router;