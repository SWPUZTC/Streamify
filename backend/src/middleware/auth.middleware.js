import jwt from 'jsonwebtoken';
import User from '../models/user.js';

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

export const protectRoute = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;
        const refreshToken = req.cookies.refreshToken;
        
        if(!accessToken && !refreshToken) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // 尝试验证 accessToken
        if(accessToken) {
            try {
                const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
                const user = await User.findById(decoded.userId).select("-password");
                if(user) {
                    req.user = user;
                    return next();
                }
            } catch(accessTokenError) {
                // accessToken 过期，尝试使用 refreshToken
                console.log('Access token expired, trying refresh token');
            }
        }

        // 如果 accessToken 无效或过期，尝试使用 refreshToken
        if(refreshToken) {
            try {
                const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
                const user = await User.findById(decoded.userId).select("-password");
                
                if(user) {
                    // 生成新的 tokens
                    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(user._id);
                    
                                         // 设置新的 cookies
                     res.cookie('accessToken', newAccessToken, {
                         maxAge: 15 * 60 * 1000,
                         httpOnly: true,
                         sameSite: 'lax',
                         secure: process.env.NODE_ENV === 'production',
                     });

                     res.cookie('refreshToken', newRefreshToken, {
                         maxAge: 7 * 24 * 60 * 60 * 1000,
                         httpOnly: true,
                         sameSite: 'lax',
                         secure: process.env.NODE_ENV === 'production',
                     });

                    req.user = user;
                    return next();
                }
            } catch(refreshTokenError) {
                console.log('Refresh token invalid:', refreshTokenError.message);
            }
        }

        return res.status(401).json({ message: 'Unauthorized' });
    } catch(err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}