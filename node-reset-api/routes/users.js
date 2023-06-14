const router = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

//updat uesr
router.put("/update", async(req,res)=>{
      if(req.body.password){
          try{
              const salt = await bcrypt.genSalt(10);
              req.body.password = await bcrypt.hash(req.body.password , salt);
          }catch(err){
            return res.status(500).json(err)
          }
      }
      try{
          const user = await User.findByIdAndUpdate(req.query.user,{
              $set: req.body,
          })
          res.status(200).json("updated");
      }catch(err){
          return res.status(500).json(err) 
      }
})


//get user
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
});

//follow a user 

router.put("/:id/follow", async (req, res) => {
      if (req.query.follower !== req.params.id) {
        try {
          const user = await User.findById(req.params.id);
          const currentUser = await User.findById(req.query.follower);
          if (!user.followers.includes(req.query.follower)) {
            await user.updateOne({ $push: { followers: req.query.follower } });
            await currentUser.updateOne({ $push: { followings: req.params.id } });
            res.status(200).json("user has been followed");
          } else {
            res.status(403).json("you allready follow this user");
          }
        } catch (err) {
          res.status(500).json(err);
        }
      } else {
        res.status(403).json("you cant follow yourself");
      }
});

// //unfollow a user

router.put("/:id/unfollow", async (req, res) => {
      if (req.query.user !== req.params.id) {
      try {
        const user = await User.findById(req.params.id);
        const currentUser = await User.findById(req.query.user);
        if (user.followers.includes(req.query.user)) {
          await user.updateOne({ $pull: { followers: req.query.user } });
          await currentUser.updateOne({ $pull: { followings: req.params.id } });
          res.status(200).json("user has been unfollowed");
        } else {
          res.status(403).json("you dont follow this user");
        }
      } catch (err) {
        res.status(500).json(err);
      }
    } else {
      res.status(403).json("you cant unfollow yourself");
    }
});

router.get("/suggesion/get/:id", async (req, res) => {
    try{
      const currentUser = await User.findById(req.params.id)
      const samples = await User.aggregate([{
        $match:{username:{$ne:currentUser.username},followers:{$ne:req.params.id}}},
        { $sample: { size: 4 } },
      ]).exec();
          res.status(200).json(samples);
    } catch (err) {
      res.status(500).json(err);
    }
});

module.exports = router;
