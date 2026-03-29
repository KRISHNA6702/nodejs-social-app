import express from "express";
const app = express();

import userModel from "./models/user.js";
import postModel from "./models/post.js";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/profile", isLoggedIn, async (req, res) => {
    let user = await userModel.findOne({ email: req.user.email }).populate("post"); 
    res.render("profile", { user });   
});

app.get("/like/:id", isLoggedIn, async (req, res) => {
    let post = await postModel.findOne({ _id: req.params.id }).populate("user");
    
    if(post.likes.indexOf(req.user.userid) === -1){
        post.likes.push(req.user.userid);
    }else{
        post.likes.splice(post.likes.indexOf(req.user.userid) , 1);
    }
    
    await post.save();
    res.redirect("/profile");   
});

app.get("/edit/:id", isLoggedIn, async (req, res) => {
    let post = await postModel.findOne({ _id: req.params.id }).populate("user");
    res.render("edit", { post });    
});

app.post("/update/:id", isLoggedIn, async (req, res) => {
    let post = await postModel.findOneAndUpdate({ _id: req.params.id } , {content : req.body.content});
    res.redirect("/profile");    
});

app.post("/register", async (req, res) => {
    let { username, name, age, email, password } = req.body;

    let user = await userModel.findOne({ email });
    if (user) {
        return res.status(500).send("user already registered");
    }

    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, async (err, hash) => {
            let user = await userModel.create({
                username,
                name,
                age,
                email,
                password: hash
            });

            jwt.sign({ email: email, userid: user._id }, "secretkey", (err, token) => {
                res.cookie("token", token);
                res.send("user registered successfully");
            });
        });
    });
});

app.post("/login", async (req, res) => {
    let { email, password } = req.body;

    let user = await userModel.findOne({ email });
    if (!user) {
        return res.status(500).send("user not found");
    }

    bcrypt.compare(password, user.password, function (err, result) {
        if (result) {
            jwt.sign({ email: email, userid: user._id }, "secretkey", (err, token) => {
                res.cookie("token", token);
                res.status(200).redirect("/profile");
            });
        } else res.redirect("/login");
    });
});

app.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.render("login");
});

function isLoggedIn(req, res, next) {
    if (!req.cookies.token) {
        return res.redirect("/login"); 
    } else {
        let data = jwt.verify(req.cookies.token, "secretkey");
        req.user = data;
        next();
    }
}

app.post("/post", isLoggedIn, async (req, res) => {
    let user = await userModel.findOne({ email: req.user.email });

    let { content } = req.body;

    let post = await postModel.create({
        user: user._id,
        content
    });

    if (!user.post) {
        user.post = [];
    }

    user.post.push(post._id);   
    await user.save();

    res.redirect("/profile");
});

app.listen(3000, () => {
    console.log("server is running on port 3000");
});
