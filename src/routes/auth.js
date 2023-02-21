const express = require("express");
const {
  register,
  login,
  logout,
  refreshToken,
} = require("../controllers/auth");
const { verifyToken } = require("../middlewares/verifyToken");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/refresh-token", refreshToken);

module.exports = router;
