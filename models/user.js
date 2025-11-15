import mongoose from "mongoose";

const userShema = new mongoose.Schema({
    username: {type: String, required: true},
    email: {type: String,required: true ,unique:true},
    password: {type: String, required:true},
    date:{type: Date, default: Date.now}
});

export default mongoose.model("User", userShema)