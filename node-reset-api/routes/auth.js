const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require ("jsonwebtoken");

router.post("/register", async (req,res)=>{
    
    try{
        const salt= await bcrypt.genSalt(10);
        const hashedPssword = await bcrypt.hash(req.body.password, salt);
        //create new user
        const newUser = new User({
            username: req.body.username,
            email:req.body.email,
            password: hashedPssword,
            name:req.body.name,
        });

        //save and respond 
        const user = await newUser.save();
        res.status(200).json(user);
    }catch(err){
        res.status(500).json(err)
    }
});

//login
router.post("/login", async (req,res)=>{
    try{
    const user = await User.findOne({username:req.body.username});
        if(!user) return res.status(404).json("usernot found");
        const validPssword = await bcrypt.compare(req.body.password , user.password)
        if(!validPssword) return res.status(400).json("incorect password")
        const token = jwt.sign({id: user.id},"secretkey");

        const { password, updatedAt, ...others } = user._doc;

        res.cookie("accessToken",token,{
            httpOnly:true,
        }).status(200).json(others);
    }catch(err){
        res.status(500).json(err)
    }
})

router.post("/logout", (req,res) => {
    res.clearCookie("accessToken",{
        secure:true,
        sameSite:"none"
    }).status(200).json("user has been loged out")
});

module.exports = router;