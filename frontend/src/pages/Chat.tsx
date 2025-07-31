import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import axiosintance from "../lib/axios";
import { LoaderIcon, VideoIcon } from "lucide-react";

import {
    Channel,
    ChannelHeader,
    Chat as ChatComponent,
    MessageList,
    MessageInput,
    Thread,
    Window,
} from "stream-chat-react"
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;
const Chat = () => {
    const { id: targetUserId } = useParams();
    const [chatClient, setChatClient] = useState<any>(null);
    const [channel, setChannel] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const { authUser } = useAuthUser();

    const { data: tokenData } = useQuery({
        queryKey: ['streamToken'],
        queryFn: async () => {
            const res = await axiosintance.get('/chat/token');
            return res.data;
        },
        enabled: !!authUser, // 只有当 authUser 存在时才启用查询
    });

    useEffect(() => {
        const initChat = async () => {
            if (!tokenData?.token || !authUser) return;
            try {
                console.log("Initializing stream chat");
                const client = StreamChat.getInstance(STREAM_API_KEY);
                await client.connectUser({
                    id: authUser._id,
                    name: authUser.name,
                    image: authUser.avatar,
                }, tokenData.token);
                const channelId = [authUser._id, targetUserId].sort().join("-");
                const currentChannel = client.channel("messaging", channelId, {
                    members: [authUser._id, targetUserId],
                });
                console.log("Channel:", currentChannel);
                await currentChannel.watch();
                console.log(currentChannel, client);
                setChannel(currentChannel);
                setChatClient(client);
            } catch (error) {
                console.error("Error initializing stream chat:", error);
                toast.error('无法连接聊天，请稍后重试');
            } finally {
                setLoading(false);
            }
        };
        initChat();
    }, [targetUserId, tokenData, authUser]);

    const handleVideoCall = async () => {
        if(channel) {
            const callUrl = `${window.location.origin}/call/${channel.id}}`
            channel.sendMessage({
                text: `向你发起视频通话`, 
            })
            toast.success('已发送视频通话邀请');
            window.location.href = callUrl;
        }
    };

    if (loading || !chatClient || !channel) return (
        <div className="h-screen flex flex-col items-center justify-center p-4">
            <LoaderIcon className="animate-spin size-10 text-primary" />
            <p className="mt-4 text-center text-lg font-mono">Connecting to chat...</p>
        </div>
    );


    return (
        <div className="h-[93vh]">
            <ChatComponent client={chatClient}>
                <Channel channel={channel}>
                    <div className="w-full relative">
                        <div className="p-3 border-b flex items-center justify-end max-w-7xl mx-auto w-full absolute top-0">
                            <button onClick={handleVideoCall} className="btn btn-success btn-sm text-white">
                                <VideoIcon className="size-6" />
                            </button>
                        </div>
                        <Window>
                            <ChannelHeader />
                            <MessageList />
                            <MessageInput focus />
                        </Window>
                        <Thread />
                    </div>
                </Channel>
            </ChatComponent>
        </div>
    );
}

export default Chat;