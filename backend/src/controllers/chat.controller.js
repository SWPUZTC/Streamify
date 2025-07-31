import { generateStreamToken } from '../lib/stream.js';

export async function getStreamToken(req, res) {
    try {
        const token = generateStreamToken(req.user._id);
        res.status(200).json({ token });
    } catch (error) {
        console.error('get stream token error', error.message);
        res.status(500).json({ message: '服务器错误' });
    }
}