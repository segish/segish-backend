const mongoose= require("mongoose")

const UserSchema = new mongoose.Schema({
    username:{
        type:String,
        require:true,
        min:3,
        max:20,
        unique:true,
    },
    email:{
        type:String,
        require:true,
        max:50,
        unique:true,
    },
    password:{
        type:String,
        require:true,
        min:6,
    },
    name:{
        type:String,
        max:50,
    },
    profilePic:{
        type:String,
        default:"",
    },
    coverPic:{
        type:String,
        default:"",
    },
    city:{
        type:String,
        default:"",
    },
    website:{
        type:String,
        default:"",
    },
    followers:{
        type:Array,
        default:[],
    },
    followings:{
        type:Array,
        default:[],
    },
},
    {timestamps:true}
    );

module.exports = mongoose.model("user",UserSchema);