import express from 'express';
import { 
    login, 
    register, 
    logout, 
    refreshToken, 
    onboarding,
    resetPassword,
    vertifyCode,
 } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);
router.get('/refresh', refreshToken);
router.post('/onboarding', protectRoute, onboarding);

router.post('/resetpassword', resetPassword);
router.post('/vertifycode', vertifyCode);

//检查是否在线
router.get('/me', protectRoute, (req, res) => {
    res.status(200).json({
        message: 'User information',
        user: req.user
    })
})


export default router;