import mongoose from "mongoose";

mongoose.connect("mongodb://localhost:27017/miniproject");

const userSchema = new mongoose.Schema({
    username : String,
    name : String,
    age : Number,
    email : String,
    password : String,
    post : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "post",
            default : []   
        }
    ]
});

export default mongoose.model("user", userSchema);
