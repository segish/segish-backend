const mongoose= require("mongoose")

const StorySchema = new mongoose.Schema({
    userId:{
        type:String,
        require:true,
    },
    img:{
        type:String,
    },
    name:{
        type:String,
    },
},
{timestamps: true},
);

module.exports = mongoose.model("Story",StorySchema);