const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    statusLine: {
      type: String,
    },
    images: {
      type: Array,
      default: [],
    },
    likeCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    userLikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    typePost: {
      type: String,
      enum: ["story", "post"],
      default: "post",
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
