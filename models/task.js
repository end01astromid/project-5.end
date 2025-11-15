import mongoose from "mongoose"

const taskSchema = new mongoose.Schema({
    text: {type: String, required: true},
    completed: {type: Boolean, default: false},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User',required: true},
    date:{type: Date, default: Date.now}
},
{timestamps: true})


export default mongoose.model('Task',taskSchema);