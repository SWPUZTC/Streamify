import { StreamChat } from 'stream-chat';
import 'dotenv/config'

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if(!apiKey || !apiSecret) {
    console.error('STREAM_API_KEY 和 STREAM_API_SECRET 未配置');
    process.exit(1);
}

const serverClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async (userData) => {
    try {
        await serverClient.upsertUsers([userData]);
        return userData;
    } catch (error) {
        console.error('更新用户失败', error);
        throw error;
    }
}

export const generateStreamToken = (userId) => {
    try {
        const userIdStr = userId.toString();
        return serverClient.createToken(userIdStr);
    } catch (error) {
        console.error('生成流令牌失败', error);
    }
}


