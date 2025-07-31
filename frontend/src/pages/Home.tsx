import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import axiosintance from "../lib/axios";
import { Link } from "react-router-dom";
import { UsersIcon, MapPinIcon, CheckCircleIcon, UserPlusIcon } from "lucide-react";
import NoFriendsFound from "../components/NoFriendCard";
import FriendCard from "../components/FriendCard";
import { getLanguageFlag } from "../components/FriendCard";
import { capitialize } from "../lib/utils";

export interface FriendCardProps {
    avatar: string;
    name: string;
    nativelanguage: string;
    learninglanguage: string;
    _id: string;
}

interface RecommendProps {
    avatar: string;
    name: string;
    nativelanguage: string;
    learninglanguage: string;
    _id: string;
    location: string;
    bio: string;
}
const Home = () => {
    const queryClient = useQueryClient();
    const [outgoingRequestsIds, setOutgoingRequestsIds] = useState<Set<string>>(new Set());

    const { data: friends = [], isLoading: loadingFriends } = useQuery({
        queryKey: ['friends'],
        queryFn: async () => {
            const response = await axiosintance.get('/user/friends');
            return response.data;
        },
    })

    const { data: recommendUsers = [], isLoading: loadingUsers } = useQuery({
        queryKey: ['recommendUsers'],
        queryFn: async () => {
            const response = await axiosintance.get('/user');
            return response.data;
        },
    })

    const { data: outgoingFriendReqs } = useQuery({
        queryKey: ['outgoingFriendReqs'],
        queryFn: async () => {
            const response = await axiosintance.get('/user/outgoing-friend-request');
            return response.data;
        },
    })

    const { mutate: sendRequestMutation, isPending } = useMutation({
        mutationFn: async (userId: string) => {
            const response = await axiosintance.post(`/user/friend-request/${userId}`);
            return response.data;
        },
        onSuccess: () => queryClient.invalidateQueries({queryKey: ["outgoingFriendReqs"]})
    })

    useEffect(() => {
        const outgoingIds = new Set<string>();
        if (outgoingFriendReqs && outgoingFriendReqs.length > 0) {
            outgoingFriendReqs.forEach((req: any) => {
                outgoingIds.add(req.recipient._id);
            });
            setOutgoingRequestsIds(outgoingIds);
        }
    }, [outgoingFriendReqs])


    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="container mx-auto space-y-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 items-start">
                    <h2 className="text-xl sm:text-3xl font-bold tracking-tight">Your Friends</h2>
                    <Link to="/notifications" className="btn btn-outline btn-sm">
                        <UsersIcon className="mr-2 size-4" />
                        Friend Requests
                    </Link>
                </div>
                {loadingFriends ? (
                    <div className="flex justify-center py-12">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                ) : friends.length === 0 ? (
                    <NoFriendsFound />
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-col-2 lg:grid-cols-3 xl:grid-cols-4">
                        {friends.map((friend: FriendCardProps) => {
                            return (
                                <FriendCard key={friend.name} {...friend} />
                            );
                        })}
                    </div>
                )}

                <section>
                    <div className="mb-6 sm:mb-8">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl sm:text-3xl font-bold tracking-tight">Meet New Friends</h2>
                                <p className="opacity-70">
                                    <span className="hidden sm:inline">Discover new friends and expand your horizons.</span>
                                </p>
                            </div>
                        </div>
                    </div>
                    {loadingUsers ? (
                        <div className="flex justify-center py-12">
                            <span className="loading loading-spinner loading-lg"></span>
                        </div>
                    ) : (
                        recommendUsers.length === 0 ? (
                            <div className="card bg-base-200 p-6 text-center">
                                <h3 className="font-semibold text-lg mb-2">No recommendations available</h3>
                                <p className="text-base-content opacity-70">
                                    Try adding more friends to get personalized recommendations
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-10">
                                {recommendUsers.map((user: RecommendProps) => {
                                    const hasRequestBeenSent = outgoingRequestsIds.has(user._id);
                                    return (
                                        <div
                                            key={user._id}
                                            className="card bg-base-200 hover:shadow-lg transition-all duration-300 md:w-md hover:cursor-pointer"
                                        >
                                            <div className="card-body p-5 space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="avatar size-16 rounded-full">
                                                        <img src={user.avatar} alt={user.name} />
                                                    </div>

                                                    <div>
                                                        <h3 className="font-semibold text-lg">{user.name}</h3>
                                                        {user.location && (
                                                            <div className="flex items-center text-xs opacity-70 mt-1">
                                                                <MapPinIcon className="size-3 mr-1" />
                                                                {user.location}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Languages with flags */}
                                                <div className="flex flex-wrap gap-1.5">
                                                    <span className="badge badge-secondary">
                                                        {getLanguageFlag(user.nativelanguage)}
                                                        Native: {capitialize(user.nativelanguage)}
                                                    </span>
                                                    <span className="badge badge-outline">
                                                        {getLanguageFlag(user.learninglanguage)}
                                                        Learning: {capitialize(user.learninglanguage)}
                                                    </span>
                                                </div>

                                                {user.bio && <p className="text-sm opacity-70">{user.bio}</p>}

                                                {/* Action button */}
                                                <button
                                                    className={`btn w-full mt-2 ${hasRequestBeenSent ? "btn-disabled" : "btn-primary"
                                                        } `}
                                                    onClick={() => sendRequestMutation(user._id)}
                                                    disabled={hasRequestBeenSent || isPending}
                                                >
                                                    {hasRequestBeenSent ? (
                                                        <>
                                                            <CheckCircleIcon className="size-4 mr-2" />
                                                            Request Sent
                                                        </>
                                                    ) : (
                                                        <>
                                                            <UserPlusIcon className="size-4 mr-2" />
                                                            Send Friend Request
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    )}
                </section>
            </div>
        </div>
    )
}

export default Home;