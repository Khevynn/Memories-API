const express = require('express');
const router = express.Router();
const User = require("../models/usersModel");
const { body, validationResult } = require('express-validator');

// Login
router.get("/auth", async function (req, res, next) {
    try {
        let result = await User.Login(req.body.username, req.body.password);
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

module.exports = router;