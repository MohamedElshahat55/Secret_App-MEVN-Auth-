const express = require("express");
const authMiddleware = require("../../middlewares/auth");

const router = express.Router();

// Auth controllers
const authControllers = require("../../controllers/authController");

router.post("/register", authControllers.register); //REGISTER
router.post("/login", authControllers.login); //LOGIN
router.post("/logout", authControllers.logout); //LOGOUT
router.post("/refresh", authControllers.refresh); // REFRESH THE TOKEN
router.get("/user", authMiddleware, authControllers.user); //GETTING USER DATA

module.exports = router;
