const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const fs = require("fs");

const getProfileByUser = asyncHandler(async (req, res) => {
  const { userId, profileId } = req.params;
  let isFriend = false;
  let isFollowing = false;
  const findUser = await User.findById(userId);
  const findFriend = await User.findById(profileId).select(
    "-password -refreshToken"
  );
  if (!findUser || !findFriend) {
    throw new Error("user or friend are not found");
  }
  if (
    findUser.friends.includes(profileId) &&
    findFriend.friends.includes(userId)
  ) {
    isFriend = true;
  }
  if (
    findUser.followings.includes(profileId) &&
    findFriend.followings.includes(userId)
  ) {
    isFollowing = true;
  }
  return res.status(200).json({
    success: true,
    message: "Get profile user is successfully",
    data: { isFollowing, isFriend, ...findFriend.toObject() },
  });
});

const sendFriendRequest = asyncHandler(async (req, res) => {
  const { userId, friendId } = req.params;
  const findUser = await User.findById(userId).select("-password");
  const findFriend = await User.findById(friendId).select("-password");
  if (!findUser || !findFriend) {
    throw new Error("Something is not found");
  }
  if (
    !findUser.friends.includes(friendId) &&
    !findUser.friendsRequest.includes(friendId)
  ) {
    await findFriend.updateOne({ $push: { friendsRequest: userId } });
    if (!findFriend.followers.includes(userId))
      await findFriend.updateOne({ $push: { followers: userId } });
    if (!findUser.followings.includes(friendId))
      await findUser.updateOne({ $push: { followings: friendId } });
  }
  return res.status(200).json({
    success: true,
    message: "Send request friend is successfully",
    data: { you: findUser, friend: findFriend },
  });
});

const unSendFriendRequest = asyncHandler(async (req, res) => {
  const { userId, friendId } = req.params;
  const findUser = await User.findById(userId);
  const findFriend = await User.findById(friendId);
  if (!findUser || !findFriend) {
    throw new Error("Something is not found");
  }
  if (
    findFriend.friends.includes(userId) ||
    findFriend.friendsRequest.includes(userId)
  ) {
    await findFriend.updateOne({ $pull: { friendsRequest: userId } });
    await findFriend.updateOne({ $pull: { followers: userId } });
    if (findUser.followings.includes(friendId))
      await findUser.updateOne({ $pull: { followings: friendId } });
  }
  return res.status(200).json({
    success: true,
    message: "Unsend request friend is successfully",
    data: { you: findUser, friend: findFriend },
  });
});

const getFollowings = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const findUser = await User.findById(userId);
  if (!findUser) {
    throw new Error("User not found");
  }
  const listFollowing = await Promise.all(
    findUser.followings.map(async (id) => {
      return await User.findById(id).select(
        "-password -email -phone -followings"
      );
    })
  );
  const formatUser = listFollowing.map((user) => {
    return user;
  });
  return res.status(200).json({
    success: true,
    message: "Successfully",
    totalFollowings: listFollowing.length,
    data: formatUser,
  });
});

const acceptFriend = asyncHandler(async (req, res) => {
  const { userId, followerId } = req.params;
  const findUser = await User.findById(userId).select("-password");
  const findFollower = await User.findById(followerId).select("-password");
  if (!findUser || !findFollower) {
    throw new Error("Something is not found");
  }
  if (!findUser.friends.includes(followerId)) {
    await findFollower.updateOne({ $push: { friends: userId } }, { new: true });
    await findUser.updateOne({ $push: { friends: followerId } }, { new: true });
    await findFollower.updateOne(
      { $pull: { followings: userId } },
      { new: true }
    );
    await findUser.updateOne(
      { $pull: { followers: followerId } },
      { new: true }
    );
  }
  if (findUser.friendsRequest.includes(followerId))
    await findUser.updateOne(
      { $pull: { friendsRequest: followerId } },
      { new: true }
    );
  return res.status(200).json({
    success: true,
    message: "Successfully",
    data: { you: findUser, friend: findFollower },
  });
});

const unacceptFriend = asyncHandler(async (req, res) => {
  const { userId, followerId } = req.params;
  const findUser = await User.findById(userId).select("-password");
  const findFollower = await User.findById(followerId).select("-password");
  if (!findUser || !findFollower) {
    throw new Error("Something is not found");
  }
  if (!findFollower.followings.includes(userId))
    await findFollower.updateOne(
      { $push: { followings: userId } },
      { new: true }
    );
  if (findUser.friendsRequest.includes(followerId))
    await findUser.updateOne(
      { $pull: { friendsRequest: followerId } },
      { new: true }
    );
  if (!findUser.followers.includes(userId))
    await findUser.updateOne(
      { $push: { followers: followerId } },
      { new: true }
    );
  return res.status(200).json({
    success: true,
    message: "Successfully",
    data: { you: findUser, friend: findFollower },
  });
});

const removeFriend = asyncHandler(async (req, res) => {
  const { userId, friendId } = req.params;
  const findUser = await User.findById(userId).select("-password");
  const findFollower = await User.findById(friendId).select("-password");
  if (!findUser || !findFollower) {
    throw new Error("Something is not found");
  }
  if (findUser.friends.includes(friendId)) {
    await findUser.updateOne({ $pull: { friends: friendId } }, { new: false });
  }
  if (findFollower.friends.includes(userId)) {
    await findFollower.updateOne(
      { $pull: { friends: userId } },
      { new: false }
    );
  }
  return res.status(200).json({
    success: true,
    message: "Successfully",
    data: { you: findUser, friend: findFollower },
  });
});

const getListFriends = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const findUser = await User.findById(userId);
  const listFriends = await Promise.all(
    findUser.friends.map(async (id) => {
      return await User.findById(id).select(
        "-password -email -phone -followings"
      );
    })
  );
  const formatUser = listFriends.map((user) => {
    return user;
  });
  return res.status(200).json({
    success: true,
    message: "Successfully",
    totalFriends: listFriends.length,
    data: formatUser,
  });
});

const getListFollowers = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const findUser = await User.findById(userId);
  const listFollowers = await Promise.all(
    findUser.followers.map(async (id) => {
      return await User.findById(id).select(
        "-password -email -phone -followings"
      );
    })
  );
  const formatUser = listFollowers.map((user) => {
    return user;
  });
  return res.status(200).json({
    success: true,
    message: "Successfully",
    totalFriends: listFollowers.length,
    data: formatUser,
  });
});

const updateAvatar = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const findUser = await User.findById(userId);
  if (!findUser) {
    throw new Error("User is not found");
  }
  const oldAvatarPath = findUser.avatar;
  console.log(req.body.formData);
  console.log(req.userId);

  const newAvatarPath = req.file.filename;
  const updateUser = await User.findByIdAndUpdate(
    findUser._id,
    {
      $set: {
        avatar: `http://localhost:5000/uploads/${newAvatarPath}`,
      },
    },
    { new: true }
  ).select("-password");
  if (!updateUser) {
    fs.unlinkSync("publics/uploads" + newAvatarPath);
  }
  return res.status(200).json({
    success: true,
    message: "Update avatar is successfully",
    data: updateUser,
  });
});

const updateCover = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const findUser = await User.findById(userId);
  if (!findUser) {
    throw new Error("User is not found");
  }
  const oldAvatarPath = findUser.avatar;
  console.log(req.file);
  const newAvatarPath = req.file.name;
  const updateUser = await User.findByIdAndUpdate(
    findUser._id,
    {
      $set: {
        cover: `http://localhost:5000/uploads/${newAvatarPath}`,
      },
    },
    { new: true }
  ).select("-password");
  if (!updateUser) {
    fs.unlinkSync("publics/uploads" + newAvatarPath);
  }
  return res.status(200).json({
    success: true,
    message: "Update avatar is successfully",
    data: updateUser,
  });
});

const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;
  if (newPassword !== confirmNewPassword) {
    throw new Error("New password and confirm password does not macth");
  }
  const { _id } = req.user;
  const findUser = await User.findById(_id);
  if (!findUser) {
    throw new Error("User not found");
  }
  if (!(await findUser.isCorrectPassword(currentPassword))) {
    throw new Error("Password is incorrect");
  }
  findUser.password = newPassword;
  await findUser.save();
  return res.status(200).json({
    success: true,
    message: "Update new password is successfully",
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const { location, sex, job, username, phone, email } = req.body;
  const saveFavorites = JSON.parse(req.body.favorites);
  const findUser = await User.findById(req.user._id);
  if (!findUser) {
    throw new Error("User not found");
  }
  const updateUser = await User.findByIdAndUpdate(
    findUser._id,
    {
      $set: {
        favorites: saveFavorites,
        location,
        sex,
        job,
        username,
        phone,
        email,
      },
    },
    { new: true }
  );
  return res.status(200).json({
    success: true,
    message: "Update user is successfully",
    data: updateUser,
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  const deleteUser = await User.findByIdAndDelete(req.user._id);
  if (!deleteUser) {
    throw new Error("User not found");
  }
  return res.status(200).json({
    success: true,
    message: "Delete user is successfully",
  });
});

const getAllByUser = asyncHandler(async (req, res) => {
  const q = req.query.q || "";
  const limit = req.query.limit || 6;
  const page = req.query.page || 1;
  const findAllUser = await User.find({})
    .select("avatar username friends followers")
    .skip(0)
    .limit(limit);
  if (!findAllUser) {
    throw new Error("User is not found");
  }
  return res.status(200).json({
    success: true,
    message: "Get all user is successfully",
    data: findAllUser,
  });
});

const unFriend = asyncHandler(async (req, res) => {});

const blockAndUnblockFriend = asyncHandler(async (req, res) => {});

const removeAvatar = asyncHandler(async (req, res) => {});

const updateCoverImgae = asyncHandler(async (req, res) => {});

const removeCoverImgae = asyncHandler(async (req, res) => {});

module.exports = {
  getProfileByUser,
  updateAvatar,
  updateCover,
  getFollowings,
  sendFriendRequest,
  unSendFriendRequest,
  removeFriend,
  acceptFriend,
  unacceptFriend,
  getListFriends,
  getListFollowers,
  updatePassword,
  updateUser,
  deleteUser,
  getAllByUser,
};
