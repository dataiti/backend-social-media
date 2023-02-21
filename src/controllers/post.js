const Post = require("../models/post");
const User = require("../models/user");
const BSON = require("bson");
const asyncHandler = require("express-async-handler");

const getPost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const findPost = await Post.findOne({ _id: postId })
    .select()
    .populate("authorId", "username avatar createdAt")
    .populate("userLikes", "avatar username");
  if (!findPost) {
    throw new Error("Post is not found");
  }
  return res.status(200).json({
    success: true,
    message: "Get post is successfully",
    data: findPost,
  });
});

const getPostFromFriendOrFollowing = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const findUser = await User.findById(userId);
  if (!findUser) {
    throw new Error("User is not found");
  }
});

const createPost = asyncHandler(async (req, res) => {
  const listImages = req.files.map(
    (image) => `http://localhost:5000/uploads/${image.filename}`
  );
  const { statusLine } = req.body;
  const findUser = await User.findById(req.params.userId);
  console.log(findUser);
  const newPost = new Post({
    authorId: req.user._id,
    statusLine,
    images: listImages,
  });
  findUser.postsIds.push(newPost._id);
  await findUser.save();
  await newPost.save();
  return res.status(200).json({
    success: true,
    message: "Create post is successfully",
    data: newPost,
  });
});

const getAllPostByUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const posts = await Post.find({ authorId: userId }).populate(
    "authorId",
    "username avatar"
  );
  const count = await Post.countDocuments({ authorId: userId });
  if (!posts) {
    throw new Error("User not found");
  }
  return res.status(200).json({
    success: true,
    message: "Get all post by one user is successfully",
    totalPosts: count,
    data: posts,
  });
});

const updatePost = asyncHandler(async (req, res) => {});

const deletePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const deletePost = await Post.findByIdAndDelete(postId);
  if (!deletePost) {
    throw new Error("Post not found");
  }
  return res.status(200).json({
    success: true,
    message: "Delete post successfully",
  });
});

const likeOrUnlikePost = asyncHandler(async (req, res) => {
  const { postId, userId } = req.params;
  const findPost = await Post.findById(postId);
  if (!findPost) {
    throw new Erro("User or post is not found");
  }
  if (findPost.userLikes.includes(userId)) {
    await findPost.updateOne({ $pull: { userLikes: userId } });
  } else {
    await findPost.updateOne({ $push: { userLikes: userId } });
  }
  const updatePost = await Post.findOneAndUpdate(
    { _id: findPost._id },
    { $set: { likeCount: findPost.userLikes.length } }
  )
    .populate("userLikes", "avatar username")
    .populate("authorId", "avatar username createdAt");
  return res.status(200).json({
    success: true,
    message: "Like post successfully",
    data: updatePost,
  });
});

module.exports = {
  getPost,
  createPost,
  getAllPostByUser,
  deletePost,
  likeOrUnlikePost,
  updatePost,
  updatePost,
  getPostFromFriendOrFollowing,
};
