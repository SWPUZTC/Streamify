import mongoose from 'mongoose';    
import bcrypt from 'bcryptjs';

/**
 * 用户模型
 * @param {string} name - 用户名
 * @param {string} email - 邮箱
 * @param {string} password - 密码
 * @param {string} avatar - 头像
 * @param {string} bio - 个人简介
 * @param {string} nativelanguage - 母语
 * @param {string} learninglanguage - 学习语言
 * @param {string} location - 位置
 * @param {boolean} isOnboarded - 是否完成个人资料填写
 */

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
    },

    password: {
        type: String,
        required: true,
        minlength: 6,
    },

    bio: {
        type: String,
        default: '',
    },

    avatar: {
        type: String,
        default: '',    
    },

    nativelanguage: {
        type: String,
        default: '',
    },

    learninglanguage: {
        type: String,
        default: '',
    },

    location: {
        type: String,
        default: '',
    },

    isOnboarded: {
        type: Boolean,
        default: false,
    },

    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      }
]
}, { timestamps: true });

// 密码加密
userSchema.pre("save", async function(next) {
    //如果密码没有修改，则跳过
    if(!this.isModified("password")) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch(err) {
        next(err);
    }
});

userSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
}

const User = mongoose.model('User', userSchema);


export default User;