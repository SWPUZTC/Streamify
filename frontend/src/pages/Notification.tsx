import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import axiosintance from "../lib/axios";
import { UserCheckIcon, BellIcon, ClockIcon, MessageSquareIcon } from "lucide-react";
import type { FriendCardProps } from "./Home";
import NoNotificationsFound from "../components/NoNotificationsFound";

interface NotificationProps {
    sender: FriendCardProps;
    _id: string;
}

interface NotificationAcceptProps {
    recipient: FriendCardProps;
    _id: string;
}
const Notification = () => {
    const queryClient = useQueryClient();

    const { data: friendRequests, isLoading } = useQuery({
        queryKey: ['friendRequests'],
        queryFn: async () => {
            const response = await axiosintance.get('/user/friend-request');
            return response.data;
        },
    })

    const { mutate: acceptRequestMutation, isPending } = useMutation({
        mutationFn: async (friendRequestId: string) => {
            const response = await axiosintance.put(`/user/friend-request/${friendRequestId}/accept`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
            queryClient.invalidateQueries({ queryKey: ['friends'] });
        }
    })

    const incomingRequests = friendRequests?.friendRequest || [];
    const outgoingRequests = friendRequests?.acceptedRequest || [];


    return (
        <div className="p-6">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6">Notifications</h1>
            <div className="container max-w-4xl space-y-8 mx-auto">
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                ) : (
                    <>
                        {incomingRequests.length > 0 && (
                            <section className="space-y-4">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <UserCheckIcon className="w-5 h-5 text-primary" />
                                    Friends Requests
                                    <span className="badge badge-primary ml-2">{incomingRequests.length}</span>
                                </h2>
                                <div className="space-y-3">
                                    {incomingRequests.map((request: NotificationProps) => (
                                        <div
                                            key={request._id}
                                            className="card bg-base-200 shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            <div className="card-body p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="avatar w-14 h-14 rounded-full bg-base-300">
                                                            <img src={request.sender.avatar} alt={request.sender.name} />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-semibold">{request.sender.name}</h3>
                                                            <div className="flex flex-wrap gap-1.5 mt-1">
                                                                <span className="badge badge-secondary badge-sm">
                                                                    Native: {request.sender.nativelanguage}
                                                                </span>
                                                                <span className="badge badge-outline badge-sm">
                                                                    Learning: {request.sender.learninglanguage}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <button
                                                        className="btn btn-primary btn-sm"
                                                        onClick={() => acceptRequestMutation(request._id)}
                                                        disabled={isPending}
                                                    >
                                                        Accept
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                        {outgoingRequests.length > 0 && (
                            <section className="space-y-4">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <BellIcon className="h-5 w-5 text-success" />
                                    New Connections
                                </h2>

                                <div className="space-y-3">
                                    {outgoingRequests.map((notification: NotificationAcceptProps) => (
                                        <div key={notification._id} className="card bg-base-200 shadow-sm">
                                            <div className="card-body p-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="avatar mt-1 size-10 rounded-full">
                                                        <img
                                                            src={notification.recipient.avatar}
                                                            alt={notification.recipient.name}
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold">{notification.recipient.name}</h3>
                                                        <p className="text-sm my-1">
                                                            {notification.recipient.name} accepted your friend request
                                                        </p>
                                                        <p className="text-xs flex items-center opacity-70">
                                                            <ClockIcon className="h-3 w-3 mr-1" />
                                                            Recently
                                                        </p>
                                                    </div>
                                                    <div className="badge badge-success">
                                                        <MessageSquareIcon className="h-3 w-3 mr-1" />
                                                        New Friend
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                        {incomingRequests.length === 0 && outgoingRequests.length === 0 && (
                            <NoNotificationsFound />
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default Notification;