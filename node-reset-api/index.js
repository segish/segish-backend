const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require ("cors");
const userRouter = require("./routes/users");
const authRouter = require("./routes/auth");
const postRouter = require("./routes/posts");
const searchRouter = require("./routes/search");
const StoryRouter = require("./routes/Stories");
const cookieParser = require("cookie-parser");
const multer = require("multer");

dotenv.config();
mongoose.connect(process.env.MONGO_URL,{ 
    useNewUrlParser: true, useUnifiedTopology: true 
},).then(()=>console.log("Connected to MongoDB"))
.catch((err)=>{console.log(err+ "Connectedghj to MongDBvvb")})

//midleware
app.use((req,res,next) => {
    res.header("Access-Control-Allow-Credentials", true);
    next();
});
app.use(express.json());
app.use(
    cors({
        origin: "https://648a03bdbbb95306e63f51e1--tranquil-pony-8a7e6e.netlify.app",
    })
);
app.use(cookieParser());
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "../social/public/upload");
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + file.originalname);
    },
  });

  const upload = multer({ storage: storage });
  
  app.post("/api/upload", upload.single("file"), (req, res) => {
    const file = req.file;
    res.status(200).json(file.filename);
  });


app.use(helmet());
app.use(morgan("common"));

app.use("/api/users", userRouter)
app.use("/api/auth", authRouter)
app.use("/api/posts", postRouter)
app.use("/api/search", searchRouter)
app.use("/api/stories", StoryRouter)


app.listen(8800, () => {
    console.log("Backend server is running!");
  });
