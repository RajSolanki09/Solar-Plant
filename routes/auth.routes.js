const express = require("express");
const authRouter = express.Router();
const authController = require("../controllers/auth.controller");
const auth = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware"); 

authRouter.post("/register", upload.single("image"), authController.register);
authRouter.post("/login", authController.login);
authRouter.post("/logout", auth, authController.logout);

module.exports = authRouter;
