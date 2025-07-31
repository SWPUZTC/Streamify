import { useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosintance from "../lib/axios";
import { CameraIcon, MapPinIcon, ShipWheelIcon, ShuffleIcon } from "lucide-react";
import { LANGUAGES } from "../constants";
import toast, { LoaderIcon } from "react-hot-toast";
import '@ant-design/v5-patch-for-react-19';

interface OnboardingFormState {
    name: string;
    bio: string;
    avatar: string;
    location: string;
    nativelanguage: string;
    learninglanguage: string;
}
const Onboarding = () => {
    const { authUser } = useAuthUser();
    const [formState, setFormState] = useState({
        name: authUser?.name || '',
        bio: authUser?.bio || '',
        location: authUser?.location || '',
        nativelanguage: authUser?.nativelanguage || '',
        learninglanguage: authUser?.learninglanguage || '',
        avatar: authUser?.avatar || '',
    });
    const queryClient = useQueryClient();

    const { mutate: onboardingMutation, isPending } = useMutation({
        mutationFn: async (formState: OnboardingFormState) => {
            const response = await axiosintance.post("/auth/onboarding", formState);
            return response.data;
        },
        onSuccess: () => {
           toast.success('资料修改成功');
            queryClient.invalidateQueries({ queryKey: ["authUser"] })
        },
        onError: (error) => { 
            toast.error((error as any).response.data.message);
        },
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onboardingMutation(formState);
    };

    const handleRandomAvatar = () => {
        const idx = Math.floor(Math.random() * 100) + 1;
        const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;
        setFormState({ ...formState, avatar: randomAvatar });
        toast.success('头像已随机生成');
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-base-100">
            <div className="card bg-base-200 w-full max-w-3xl shadow-xl">
                <div className="card-body p-6 sm:p-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">Complete Your Profile</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* 头像 */}
                        <div className="flex items-center justify-center flex-col space-y-4">
                            <div className="size-32 rounded-full bg-base-300 overflow-hidden">
                                {formState.avatar ? (
                                    <img
                                        src={formState.avatar}
                                        alt="Profile Preview"
                                        className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <CameraIcon className="size-12 text-base-content opacity-40" />
                                    </div>
                                )}
                            </div>
                            {/* 生成随机头像 */}
                            <div className="flex items-center gap-2">
                                <button type="button" onClick={handleRandomAvatar} className="btn btn-accent">
                                    <ShuffleIcon className="size-4 mr-2" />
                                    Generate Random Avatar
                                </button>
                            </div>
                        </div>
                        {/* 提交表单 */}
                        <div className="form-control">
                            <label className="label mb-4" htmlFor="username">
                                <span className="label-text">昵称</span>
                            </label>
                            <input
                                id="username"
                                type="text"
                                className="border border-primary w-full rounded-md p-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                placeholder="输入用户名"
                                value={formState.name}
                                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                                />
                        </div>

                        {/* Bio */}
                        <div className="form-control">
                            <label className="label mb-4" htmlFor="bio">
                                <span className="label-text">Bio</span>
                            </label>
                            <textarea
                                id="bio"
                                className="h-24 w-full p-2 border rounded-md border-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                placeholder="个性签名"
                                value={formState.bio}
                                onChange={(e) => setFormState({ ...formState, bio: e.target.value })}
                                />
                        </div>

                        {/* language */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* nativelanguage */}
                            <div className="form-control">
                                <label htmlFor="nativelanguage" className="label mb-4">
                                    <span className="label-text">母语</span>
                                </label>
                                <select
                                    name="nativelanguage"
                                    id="nativelanguage"
                                    value={formState.nativelanguage}
                                    onChange={(e) => setFormState({ ...formState, nativelanguage: e.target.value })}
                                    className="select select-bordered w-full border-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                                    {LANGUAGES.map(language => {
                                        return (
                                            <option key={`native-${language}`} value={language.toLowerCase()}>
                                                {language}
                                            </option>
                                        )
                                    })}
                                </select>
                            </div>
                            {/* learinglanguage */}
                            <div className="form-control">
                                <label htmlFor="learninglanguage" className="label mb-4">
                                    <span className="label-text">学习</span>
                                </label>
                                <select
                                    name="learninglanguage"
                                    id="learninglanguage"
                                    value={formState.learninglanguage}
                                    onChange={(e) => setFormState({ ...formState, learninglanguage: e.target.value })}
                                    className="select select-bordered w-full border-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                                    {LANGUAGES.map(language => {
                                        return (
                                            <option key={`native-${language}`} value={language.toLowerCase()}>
                                                {language}
                                            </option>
                                        )
                                    })}
                                </select>
                            </div>
                        </div>

                        {/* location */}
                        <div className="form-control">
                            <label className="label mb-4"> 
                                <span className="label-text">位置</span>
                            </label>
                            <div className="relative">
                                <MapPinIcon className="absolute top-1/2 -translate-y-1/2 transform left-3 size-5
                                text-base-content opacity-70" />
                                <input 
                                name="location"
                                value={formState.location}
                                onChange={(e) => setFormState({...formState, location: e.target.value})}
                                className="border border-primary w-full rounded-md pl-10 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                placeholder="城市和国家"
                                type="text" />
                            </div>
                        </div>

                        {/* 提交按钮 */}
                        <button className="btn btn-primary w-full" disabled={isPending} type="submit">
                            { !isPending ? 
                            (
                                <>
                                  <ShipWheelIcon className="size-5 mr-2"/>
                                  完成修改
                                </>
                            ) : 
                            (
                                <>
                                  <LoaderIcon className="animate-spin size-5 mr-2"/>
                                  加载中...
                                </>
                            ) }
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )

}

export default Onboarding;