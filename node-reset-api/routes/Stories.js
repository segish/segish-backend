const router = require("express").Router();
const Story = require("../models/Story");
const User = require("../models/User");
const jwt = require("jsonwebtoken");


//create stories
router.post("/", async (req, res) => {
    const token = req.cookies.accessToken;
    if(!token) return res.status(401).json("You must login first!");

    jwt.verify(token, "secretkey", async (err, userInfo)=>{
        if(err) return res.status(403).json("Token is not valid!");
        
        const currentUser = await User.findById(userInfo.id);
        const values={
                userId: userInfo.id,
                img : req.body.img,
                name : currentUser.name,
            }
            
        const newStory = new Story(values);
        try {
        const savedStory = await newStory.save();
        res.status(200).json(savedStory);
        } catch (err) {
        res.status(500).json(err);
        } 
    })
  });
//get timeline stories

router.get("/", async (req, res) => {
    const token = req.cookies.accessToken;
    if(!token) return res.status(401).json("You must login first!");

    jwt.verify(token, "secretkey", async (err, userInfo)=>{
        if(err) return res.status(403).json("Token is not valid!");
    try {
      const currentUser = await User.findById(userInfo.id);
      const userStories = await Story.find({ userId: currentUser._id });
      const friendStories = await Promise.all(
        currentUser.followings.map((friendId) => {
          return Story.find({ userId: friendId });
        })
      );
      res.json(userStories.concat(...friendStories))
    } catch (err) {
      res.status(500).json(err);
    }
})
  });
  

  module.exports = router;