import React, { useState } from "react";
import { ShipWheelIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import axiosintance from "../lib/axios";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import '@ant-design/v5-patch-for-react-19';

interface UserInfo {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

const Register: React.FC = () => {
    const [userInfo, setUserInfo] = useState<UserInfo>({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const navigate = useNavigate();

    const queryClient = useQueryClient();

    const { mutate: RegisterMutation, isPending, error } = useMutation({
        mutationFn: async (userInfo: UserInfo) => {
            const response = await axiosintance.post("/auth/register", userInfo);
            navigate("/");
            return response.data;
        },
        onSuccess: () => queryClient.invalidateQueries({queryKey: ["authUser"]}),
    })

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(userInfo.password !== userInfo.confirmPassword) {
            message.error("两次输入的密码不一致");
            return;
        }
        RegisterMutation(userInfo);
        message.success("注册成功");
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
                                <h2 className="text-xl font-semibold">Create an Account</h2>
                                <p className="text-sm opacity-70">
                                    Join Streamify and start start your language learning adventure!
                                </p>
                            </div>
                            <div className="space-y-6">
                                {/* Name */}
                                <div className="form-control w-full flex flex-col gap-3">
                                    <label className="label" htmlFor="username">
                                        <span className="label-text">用户名</span>
                                    </label>
                                    <input 
                                        id="username"
                                        type="text"
                                        className="input w-lg"
                                        placeholder="输入用户名"
                                        value={userInfo.name}
                                        onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                                        required />
                                </div>
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
                                        autoComplete="new-password"
                                        className="input w-lg"
                                        placeholder="输入密码"
                                        value={userInfo.password}
                                        onChange={(e) => setUserInfo({ ...userInfo, password: e.target.value })}
                                        required />
                                    <p className="text-xs opacity-70 mt-1">
                                        密码长度至少为6位
                                    </p>
                                </div>
                                {/* Confirm Password */}
                                <div className="form-control w-full flex flex-col gap-3">
                                    <label className="label" htmlFor="confirm-password">
                                        <span className="label-text">确认密码</span>
                                    </label>
                                    <input 
                                        type="password"
                                        autoComplete="new-password"
                                        id="confirm-password"
                                        className="input w-lg"
                                        placeholder="输入上面的密码"
                                        value={userInfo.confirmPassword}
                                        onChange={(e) => setUserInfo({ ...userInfo, confirmPassword: e.target.value })}
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
                                { isPending ? "加载中..." : "注册" }
                            </button>

                            <div className="text-center my-4">
                                <p className="text-sm">
                                    已有账号？ <Link to="/login" className="text-primary hover:underline">登录</Link>
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

export default Register;