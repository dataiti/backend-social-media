const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const verifyToken = asyncHandler(async (req, res, next) => {
  if (req.headers.authorization.startsWith("Bearer ")) {
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, process.env.JWT_ACCESS_SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          cuccess: false,
          message: "Access token is invalid",
        });
      }
      req.user = decoded;
      next();
    });
  } else {
    return res.status(401).json({
      cuccess: false,
      message: "Access token is required",
    });
  }
});

module.exports = {
  verifyToken,
};
