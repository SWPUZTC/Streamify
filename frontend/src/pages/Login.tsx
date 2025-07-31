import React, { useState } from "react";
import { ShipWheelIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import axiosintance from "../lib/axios";
import { message } from "antd";
import '@ant-design/v5-patch-for-react-19';

interface UserInfo {
    email: string;
    password: string;
}

const Login: React.FC = () => {
    const [userInfo, setUserInfo] = useState<UserInfo>({
        email: "",
        password: "",
    });


    const queryClient = useQueryClient();

    const { mutate: LoginMutation, isPending, error } = useMutation({
        mutationFn: async (userInfo: UserInfo) => {
            const response = await axiosintance.post("/auth/login", userInfo);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["authUser"]});
            message.success("登录成功");
        },
    })

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        LoginMutation(userInfo);
    }

    return (
        <div className="min-h-screen flex items-center justify-center
        p-4 sm:p-6 md:p-8" data-theme="forest">
            {/* 页面左侧: 注册表单 */}
            <div className="border border-primary/25 flex flex-col w-full max-w-xl mx-auto bg-base-100 
                rounded-xl shadow-lg overflow-auto">
                {/* Logo */}
                <div className="w-full lg:w-1/2 px-4 pt-4 flex flex-col sm:px-8 sm:pt-8">
                    <div className="flex items-center justify-start gap-2">
                        <ShipWheelIcon className="size-9 text-primary" />
                        <span className="text-3xl font-bold font-mono bg-clip-text text-transparent
                        bg-gradient-to-r from-primary to-secondary tracking-wider">
                            Streamify
                        </span>
                    </div>
                </div>

                {error && (
                    <div className="ml-4 alert alert-error shadow-lg mt-4 px-4 py-2 w-1/2 sm:ml-8">
                        <span>{(error as any).response.data.message}</span> 
                    </div>
                )}

                {/* Form */}
                <div className="w-full px-4 pt-4 sm:px-8">
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-xl font-semibold">Welcome Back</h2>
                                <p className="text-sm opacity-70">
                                    Sign in to your account to continue your language journey.
                                </p>
                            </div>
                            <div className="space-y-6">
                                {/* Email */}
                                <div className="form-control w-full flex flex-col gap-3">
                                    <label className="label" htmlFor="email">
                                        <span className="label-text">邮箱</span>
                                    </label>
                                    <input 
                                        id="email"
                                        className="input w-lg"
                                        placeholder="输入邮箱"
                                        value={userInfo.email}
                                        onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                                        required />
                                </div>
                                {/* Password */}
                                <div className="form-control w-full flex flex-col gap-3">
                                    <label className="label" htmlFor="password">
                                        <span className="label-text">密码</span>
                                    </label>
                                    <input 
                                        type="password"
                                        id="password"
                                        autoComplete="current-password"
                                        className="input w-lg"
                                        placeholder="输入密码"
                                        value={userInfo.password}
                                        onChange={(e) => setUserInfo({ ...userInfo, password: e.target.value })}
                                        required />
                                </div>
                                {/* Checkbox */}
                                <div className="form-control">
                                    <label className="label cursor-pointer gap-2 justify-start">
                                        <input type="checkbox" className="checkbox checkbox-xs" required />
                                        <span className="text-xs leading-tight">
                                            我已阅读 并同意 <a href="#" className="text-primary hover:underline">隐私政策</a> 和 <a href="#" className="text-primary hover:underline">服务条款</a>
                                        </span>
                                    </label>
                                </div>
                            </div>
                            <button className="btn btn-primary w-full" type="submit">
                                { isPending ? (
                                    <>
                                      <span className="loading loading-spinner loading-xs">
                                        加载中...
                                      </span>
                                    </>
                                ) : "登录" }
                            </button>

                            <div className="text-center my-4">
                                <p className="text-sm">
                                    还未注册？ <Link to="/register" className="text-primary hover:underline">点击创建</Link>
                                </p>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            {/* 右侧图片 */}
            <div className="hidden lg:block lg:w-1/2">
                <img src="/i.png" alt="illstration" className="w-full h-auto" />
            </div>
        </div >

    )

}

export default Login;