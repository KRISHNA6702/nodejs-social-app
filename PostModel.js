import mongoose from "mongoose";
import user from "./user.js";

const postSchema = new mongoose.Schema({
   user: {
    type : mongoose.Schema.Types.ObjectId,
    ref : "user"
   },
   content: String,
   likes : [
    {
        type : mongoose.Schema.Types.ObjectId,
        ref:user
    }
   ]
   
}, {timestamps : true});

export default mongoose.model("post",postSchema);
