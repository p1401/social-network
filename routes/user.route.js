const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const authMiddleware = require("../middleware/authentication");

router.post("/users/login", userController.signIn);
router.post("/users/register", userController.signUp);
router.get("/users/profile", authMiddleware.isAuth, userController.profile);

router.get(
  "/users/followers",
  authMiddleware.isAuth,
  userController.getFollower
);
router.get("/users", authMiddleware.isAuth, userController.searchUserByName);

router.get(
  "/users/changeFollow/:id",
  authMiddleware.isAuth,
  userController.changeFollow
);

module.exports = router;
