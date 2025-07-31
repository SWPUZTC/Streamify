import { upsertStreamUser } from "../lib/stream.js";
import User from "../models/user.js";
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import VertifyCode from "../models/vertifycode.js";


//生成随机验证码
function generateCode(length = 6) {
    return Math.random().toString().slice(2, 2 + length);
}

function generateTokens(userId) {
    const accessToken = jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
        { userId },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
}


export async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: '请填写所有必填字段' });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: '用户不存在' });

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) return res.status(401).json({ message: '密码错误' });

        const { accessToken, refreshToken } = generateTokens(user._id);

        res.cookie('accessToken', accessToken, {
            maxAge: 15 * 60 * 1000,
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
        });

        res.cookie('refreshToken', refreshToken, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
        });

        res.status(200).json({
            message: '登录成功',
            user: user,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

export async function register(req, res) {
    const { email, password, name } = req.body;

    try {
        if (!email || !password || !name) {
            return res.status(400).json({ message: '请填写所有必填字段' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: '密码长度至少为6位' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: '请输入有效的邮箱地址' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: '该邮箱已被注册' });
        }

        const index = Math.floor(Math.random() * 100) + 1; //随记生成1-100的数字
        const randomAvatar = `https://avatar.iran.liara.run/public/${index}.png`;
        const newUser = await User.create({
            email,
            name,
            password,
            avatar: randomAvatar,
        })
        await upsertStreamUser({
            id: newUser._id.toString(),
            name: newUser.name,
            image: newUser.avatar || "",
        });
        console.log(`Stream用户${newUser.name}创建成功`);
        const { accessToken, refreshToken } = generateTokens(newUser._id);
        res.cookie('accessToken', accessToken, {
            maxAge: 15 * 60 * 1000,
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
        });

        res.cookie('refreshToken', refreshToken, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
        });

        res.status(201).json({
            message: '注册成功',
            user: newUser,
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Internal Server Error',
        });
    }
}

export function logout(req, res) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(200).json({ message: '退出成功' });
}

export async function refreshToken(req, res) {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
        return res.status(401).json({ message: '未提供refresh token' });
    }
    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId);

        // 刷新cookie
        res.cookie('accessToken', accessToken, {
            maxAge: 15 * 60 * 1000,
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
        });
        res.cookie('refreshToken', newRefreshToken, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
        });

        res.json({ message: '刷新成功' });
    } catch (err) {
        return res.status(401).json({ message: 'refresh token无效或已过期' });
    }
}

export async function onboarding(req, res) {
    try {
        const userId = req.user._id;
        const { name, bio, nativelanguage, learninglanguage, location } = req.body;
        if (!name || !bio || !nativelanguage || !learninglanguage || !location) {
            return res.status(400).json({
                message: '请填写所有必填字段',
                missingFileds: [
                    !name && 'name',
                    !bio && 'bio',
                    !nativelanguage && 'nativelanguage',
                    !learninglanguage && 'learninglanguage',
                    !location && 'location',
                ].filter(Boolean),
            });
        }

        const updatedUser = await User.findByIdAndUpdate(userId, {
            ...req.body,
            isOnboarded: true,
        }, { new: true });

        if (!updatedUser) return res.status(404).json({ message: '用户不存在' });

        try {
            await User.updatedUser({
                id: updatedUser._id.toString(),
                name: updatedUser.name,
                image: updatedUser.avatar || "",
            })
            console.log(`Stream用户${updatedUser.name}更新成功`);
        } catch (error) {
            console.log('Stream用户更新失败', error);
        }


        res.status(200).json({
            message: 'Onboarding successful',
            user: updatedUser,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function vertifyCode(req, res) {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: '邮箱不能为空' });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: '用户不存在' });

        const transport = nodemailer.createTransport({
            service: 'qq',
            host: 'smtp.qq.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            to: email,
            from: process.env.EMAIL_USER,
            subject: '重置密码',
            text: generateCode(),
        }

        transport.sendMail(mailOptions, async (error, info) => {
            if (error) {
                return res.status(500).json({
                    status: 'error',
                    message: error.message
                })
            } else {
                await VertifyCode.findOneAndUpdate(email, { code: mailOptions.text })
                return res.status(200).json({
                    info: info.response,
                    status: 'success',
                    message: '邮件发送成功',
                })
            }
        });
    } catch (error) {
        console.log('vertifycode failed', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function resetPassword(req, res) {
    try {
        const { email, code, password } = req.body;
        const isvertified = await VertifyCode.findOne({ email, code });
        if (!isvertified) {
            return res.status(400).json({ message: '验证码错误' });
        }
        await User.findOneAndUpdate(email, { password });
        await VerifyCode.findOneAndDelete(email);
        return res.status(200).json({ message: '重置密码成功' });
    } catch (error) {
        console.log('resetpassword failed', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}
