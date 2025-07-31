import mongoose from "mongoose";

const vertifyCodeSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    code: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 2, // 5 minutes
    },
});

const VertifyCode = mongoose.model("VertifyCode", vertifyCodeSchema);

export default VertifyCode;