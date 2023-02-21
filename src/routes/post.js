const express = require("express");
const {
  createPost,
  getAllPostByUser,
  deletePost,
  getPost,
  likeOrUnlikePost,
  getPostFromFriendOrFollowing,
} = require("../controllers/post");
const { verifyToken } = require("../middlewares/verifyToken");
const upload = require("../configs/configStorage");

const router = express.Router();

router.get("/get-post/:postId", getPost);
router.get("/all-post/by-user/:userId", verifyToken, getAllPostByUser);
router.get(
  "/all-post/followings/friends/:userId",
  verifyToken,
  getPostFromFriendOrFollowing
);

router.post(
  "/create-post/:userId",
  verifyToken,
  upload.array("postImages"),
  createPost
);
router.put("/like-unlike/:userId/:postId", likeOrUnlikePost);
router.delete("/delete-post/:postId", deletePost);

module.exports = router;
