const express = require("express");
const {
  updateAvatar,
  sendFriendRequest,
  unSendFriendRequest,
  getFollowings,
  acceptFriend,
  unacceptFriend,
  removeFriend,
  getListFriends,
  getListFollowers,
  updatePassword,
  updateUser,
  deleteUser,
  getAllByUser,
  getProfileByUser,
  updateCover,
} = require("../controllers/user");
const upload = require("../configs/configStorage");
const { verifyToken } = require("../middlewares/verifyToken");

const router = express.Router();

router.get("/all-users", getAllByUser);
router.get("/followings/:userId", getFollowings);
router.get("/profile/:userId/:profileId", getProfileByUser);

// get list
router.get("/list-friends/:userId", getListFriends);
router.get("/list-followers/:userId", getListFollowers);

// upload avatar
router.post("/update-avatar/:userId", upload.single("avatar"), updateAvatar);
router.post("/update-cover/:userId", upload.single("cover"), updateCover);

// send or unsend request friend
router.put("/send-request-friend/:userId/:friendId", sendFriendRequest);
router.put("/unsend-request-friend/:userId/:friendId", unSendFriendRequest);

// accept or unaccept resquest friend
router.put("/accept-friend/:userId/:followerId", acceptFriend);
router.put("/unaccept-friend/:userId/:followerId", unacceptFriend);

// romove friend
router.put("/remove-friend/:userId/:friendId", removeFriend);

router.put("/update-user/:userId", updateUser);
router.put("/update-password", updatePassword);
router.delete("/delete-user/:userId", deleteUser);

module.exports = router;
