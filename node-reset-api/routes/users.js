const router = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

//updat uesr
router.put("/update", async(req,res)=>{
  const token = req.cookies.accessToken;
  if(!token) return res.status(401).json("You must login first!");

  jwt.verify(token, "secretkey", async (err, userInfo)=>{
      if(err) return res.status(403).json("Token is not valid!");
      if(req.body.password){
          try{
              const salt = await bcrypt.genSalt(10);
              req.body.password = await bcrypt.hash(req.body.password , salt);
          }catch(err){
            return res.status(500).json(err)
          }
      }
      try{
          const user = await User.findByIdAndUpdate(userInfo.id,{
              $set: req.body,
          })
          res.status(200).json("updated");
      }catch(err){
          return res.status(500).json(err) 
      }
    })
})

//delete user
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json("Account has been deleted");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can delete only your account!");
  }
});



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
  const token = req.cookies.accessToken;
  if(!token) return res.status(401).json("You must login first!");

  jwt.verify(token, "secretkey", async (err, userInfo)=>{
      if(err) return res.status(403).json("Token is not valid!");
      if (userInfo.id !== req.params.id) {
        try {
          const user = await User.findById(req.params.id);
          const currentUser = await User.findById(userInfo.id);
          if (!user.followers.includes(userInfo.id)) {
            await user.updateOne({ $push: { followers: userInfo.id } });
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
    })
});

// //unfollow a user

router.put("/:id/unfollow", async (req, res) => {
  const token = req.cookies.accessToken;
  if(!token) return res.status(401).json("You must login first!");

  jwt.verify(token, "secretkey", async (err, userInfo)=>{
      if(err) return res.status(403).json("Token is not valid!");
      if (userInfo.id !== req.params.id) {
      try {
        const user = await User.findById(req.params.id);
        const currentUser = await User.findById(userInfo.id);
        if (user.followers.includes(userInfo.id)) {
          await user.updateOne({ $pull: { followers: userInfo.id } });
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
  })
});

router.get("/suggesion/get", async (req, res) => {
  const token = req.cookies.accessToken;
  if(!token) return res.status(401).json("You must login first!");

  jwt.verify(token, "secretkey", async (err, userInfo)=>{
      if(err) return res.status(403).json("Token is not valid!");
    try{
      const currentUser = await User.findById(userInfo.id)
      const samples = await User.aggregate([{
        $match:{username:{$ne:currentUser.username},followers:{$ne:userInfo.id}}},
        { $sample: { size: 4 } },
      ]).exec();
          res.status(200).json(samples);
    } catch (err) {
      res.status(500).json(err);
    }
  })
});

// //search user
// router.get("/search/get", async (req, res) => {
//   try{
//     const search = await User.findById(567890)
//     const { password, updatedAt, ...others } = search._doc;
//         res.status(200).json(others);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });


module.exports = router;
