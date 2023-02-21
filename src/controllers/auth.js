const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const generateAccessToken = (_id) => {
  return jwt.sign({ _id }, process.env.JWT_ACCESS_SECRET_KEY, {
    expiresIn: "1d",
  });
};

const generateRefreshToken = (_id) => {
  return jwt.sign({ _id }, process.env.JWT_REFRESH_SECRET_KEY, {
    expiresIn: "7d",
  });
};

const register = asyncHandler(async (req, res) => {
  const findUser = await User.findOne({ email: req.body.email });
  if (findUser) {
    throw new Error("User is exsist");
  }
  const newUser = new User(req.body);
  await newUser.save();
  return res.status(200).json({
    cuccess: true,
    message: "Register user successfully !",
  });
});

const login = asyncHandler(async (req, res) => {
  const { phone, email } = req.body;
  const findUser = await User.findOne({
    $or: [{ email }, { phone }],
  });
  if (!findUser) {
    throw new Error("User not found");
  }
  if (!(await findUser.isCorrectPassword(req.body.password))) {
    throw new Error("Password is incorrect");
  }
  const accessToken = generateAccessToken(findUser._id);
  const refreshToken = generateRefreshToken(findUser._id);
  const { password, ...other } = findUser.toObject();
  await User.findOneAndUpdate(
    { _id: findUser._id },
    { $set: { refreshToken } },
    { new: true }
  );
  return (
    res
      // .cookie("refreshToken", refreshToken, {
      //   httpOnly: true,
      //   maxAge: 60 * 60 * 24 * 7 * 1000,
      // })
      .status(200)
      .json({
        success: true,
        message: "Login successfully !",
        accessToken,
        data: { ...other },
      })
  );
});

const logout = asyncHandler(async (req, res) => {
  // const { refreshToken } = req.cookies;
  // if (!refreshToken) {
  //   throw new Error("Refresh token not found in cookie");
  // }
  await User.findOneAndUpdate(
    { refreshToken },
    { $set: { refreshToken: "" } },
    { new: true }
  );
  return res
    .clearCookie("refreshToken", { httpOnly: true, secure: true })
    .status(200)
    .json({
      success: true,
      message: "Logout successfully !",
    });
});

const refreshToken = asyncHandler(async (req, res) => {
  // const { refreshToken } = req.cookies;
  // if (!refreshToken) {
  //   throw new Error("Refresh token not found in cookie");
  // }
  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET_KEY);
  const findUser = await User.findOne({ _id: decoded._id, refreshToken });
  if (!findUser) {
    throw new Error("Refresh token is invalid");
  }
  const newAccessToken = generateAccessToken(findUser._id);
  return res.status(200).json({
    success: true,
    message: "Get refresh token successfully",
    accessToken: newAccessToken,
  });
});

const forgotPassword = asyncHandler(async (req, res) => {});

const resetPassword = asyncHandler(async (req, res) => {});

module.exports = {
  register,
  login,
  logout,
  refreshToken,
};
