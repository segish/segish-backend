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
app.use(express.json({limit : '50mb'}));
app.use(express.urlencoded({limit : '50mb',extended : true}));
app.use(
    cors({
        origin: "https://64a08dfea3ef6d67057df2ea--tranquil-kleicha-865e83.netlify.app",
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


app.listen(3000, () => {
    console.log("Backend server is running!");
  });
