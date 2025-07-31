import { useQuery } from "@tanstack/react-query"
import  axiosintance  from "../lib/axios.ts"

const useAuthUser = () => {
    const authUser = useQuery({
        queryKey: ["authUser"],
        queryFn: async () => {
            const response = await axiosintance.get("/auth/me");
            return response.data;
        },
        retry: false,
    });

    return { isLoading: authUser.isLoading, authUser: authUser.data?.user, error: authUser.error }
}

export default useAuthUser;