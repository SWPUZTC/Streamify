import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import axiosintance from "../lib/axios";
import {
    StreamVideo,
    StreamVideoClient,
    StreamCall,
    CallControls,
    SpeakerLayout,
    StreamTheme,
    CallingState,
    useCallStateHooks,
} from "@stream-io/video-react-sdk";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import toast from "react-hot-toast";
import { LoaderIcon } from "lucide-react";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const Call = () => {
    const { id: CallId } = useParams();
    const [client, setClient] = useState<any>(null);
    const [call, setCall] = useState<any>(null);
    const [isConnecting, setIsConnecting] = useState(true);

    const { authUser } = useAuthUser();
    const { data: tokenData, isLoading } = useQuery({
        queryKey: ['streamToken'],
        queryFn: async () => {
            const res = await axiosintance.get('/chat/token');
            return res.data;
        },
        enabled: !!authUser, // 只有当 authUser 存在时才启用查询
    });

    useEffect(() => {
        console.log(CallId);
        
        const initVideo = async () => {
            if (!tokenData?.token || !authUser) return;
            try {
                console.log('Video Call');
                const user = {
                    id: authUser._id,
                    name: authUser.name,
                    image: authUser.avatar
                };
                const videoClient = new StreamVideoClient({
                    apiKey: STREAM_API_KEY,
                    user,
                    token: tokenData.token,
                });
                const callInstance = videoClient.call("default", CallId!);
                await callInstance.join({ create: true });
                setClient(videoClient);
                setCall(callInstance);
            } catch (error) {
                console.error("Error initializing stream video:", error);
                toast.error('无法连接视频，请稍后重试');
            } finally {
                setIsConnecting(false);
            }
        }
        initVideo();
    }, [authUser, CallId, tokenData])

    if (isConnecting || !client || !call || isLoading) {
        return (<div className="h-screen flex flex-col items-center justify-center p-4">
            <LoaderIcon className="animate-spin size-10 text-primary" />
            <p className="mt-4 text-center text-lg font-mono">Connecting to video...</p>
        </div>)
    }
    return (
        <div className="h-screen flex flex-col items-center justify-center">
            <div className="relative">
                {client && call ? (
                    <StreamVideo client={client}>
                        <StreamCall call={call}>
                            <CallContent />
                        </StreamCall>
                    </StreamVideo>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-center text-lg font-mono">
                            连接失败，请刷新或者稍后重试
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

const CallContent = () => {
    const { useCallCallingState } = useCallStateHooks();
    const callingState = useCallCallingState();
    const navigate = useNavigate();

    if(callingState === CallingState.LEFT) {
        navigate("/");
    }
    return (
        <StreamTheme>
            <SpeakerLayout/>
            <CallControls/>
        </StreamTheme>
    );
}

export default Call;