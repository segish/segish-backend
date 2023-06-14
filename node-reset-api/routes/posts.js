const router = require("express").Router();
const Post = require("../models/post");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

//create post
router.post("/", async (req, res) => {
    const values={
      userId : req.body.userId,
      desc : req.body.desc,
      img : req.body.img,
  }
  const newPost = new Post(values);
  try {
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});
//delete a post

router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
      await post.deleteOne();
      res.status(200).json("the post has been deleted");
  } catch (err) {
    res.status(500).json(err);
  }
});
//add comment
router.put("/:id/comment", async (req, res) => {
    try {
      const currentUser = await User.findById(req.body.userId)
      const values={
        name:currentUser.name,
        profilePic:currentUser.profilePic,
        userId: req.body.userId,
        desc : req.body.desc,
      }
      const post = await Post.findById(req.params.id);
        await post.updateOne({ $push: { comments:values } });
        res.status(200).json("The post has been commented");      
    } catch (err) {
      res.status(500).json(err);
    }
});

//get comment
router.get("/:id/comment", async (req, res) => {
  try {
    const posts = await Post.findById(req.params.id);
      const comment = posts.comments;
      res.status(200).json(comment);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get timeline posts

router.get("/:id/get", async (req, res) => {
      const userid = req.query.profile;
      if(userid!=="undefined"){
        const userselfPosts = await Post.find({ userId: userid });
        res.json(userselfPosts)
      }
      else{  
        try {
          const currentUser = await User.findById(req.params.id);
          const userPosts = await Post.find({ userId: currentUser._id });
          const friendPosts = await Promise.all(
            currentUser.followings.map((friendId) => {
              return Post.find({ userId: friendId });
            })
          );
          res.json(userPosts.concat(...friendPosts))
        } catch (err) {
          res.status(500).json(err);
      }
    }
});


//like / dislike a post

router.post("/like/:id", async (req, res) => {
      try {
        const post = await Post.findById(req.params.id);
        if (!post.likes.includes(req.body.userId)) {
          await post.updateOne({ $push: { likes: req.body.userId } });
          res.status(200).json("The post has been liked");
        } else {
          await post.updateOne({ $pull: { likes: req.body.userId } });
          res.status(200).json("The post has been disliked");
        }
      } catch (err) {
        res.status(500).json(err);
      }
  });
//get like
router.get("/:id/likes", async (req, res) => {
  try {
    const posts = await Post.findById(req.params.id);
      const like = posts.likes;
      res.status(200).json(like);
  } catch (err) {
    res.status(500).json(err);
  }
});


 module.exports = router;
