const express = require('express');
const router = express.Router();
const User = require("../models/usersModel");
const { body, validationResult } = require('express-validator');

// Get Info
router.get("/", async function (req, res, next) {
    try {
        let result = await User.GetUserInfo(req.query.user_id);
        res.status(result.status).send(result.data);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

// Login
router.get("/auth", async function (req, res, next) {
    try {
        let result = await User.Login(req.query.username, req.query.password);
        res.status(result.status).send(result.data);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

// Register
router.post("/auth", async function (req, res, next) {
    try {
        let user = new User();
        user.username = req.body.username;
        user.password = req.body.password;

        let result = await User.Register(user);
        res.status(result.status).send(result.data);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

// Fruits
router.patch("/fruits", async function (req, res, next) {
    try {
        let result = await User.AddFruits(req.body.user_id);
        res.status(result.status).send(result.data);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

module.exports = router;