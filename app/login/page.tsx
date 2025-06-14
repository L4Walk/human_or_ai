'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn as nextAuthSignIn } from 'next-auth/react';  // 使用 next-auth/react 的客户端函数

interface FormData {
    email: string;
    password: string;
}

interface FormErrors {
    email?: string;
    password?: string;
}

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<FormData>({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loginError, setLoginError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setErrors(prev => ({ ...prev, [name]: '' }));
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        const newErrors: FormErrors = {};
        if (!formData.email) {
            newErrors.email = '请输入邮箱地址';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = '请输入有效的邮箱地址';
        }

        if (!formData.password) {
            newErrors.password = '请输入密码';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setLoginError('');

        try {
            const response = await nextAuthSignIn('credentials', {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            console.log('登录响应:', response);

            if (!response) {
                setLoginError('服务器响应错误');
                return;
            }

            if (response.error) {
                setLoginError('邮箱或密码不正确');
                return;
            }

            if (response.ok) {
                router.push('/');
                router.refresh();
            }
        } catch (error) {
            console.error('登录错误:', error);
            setLoginError('登录失败，请稍后再试');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        登录账户
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                邮箱地址
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                                    errors.email ? 'border-red-300' : 'border-gray-300'
                                } rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                                value={formData.email}
                                onChange={handleChange}
                            />
                            {errors.email && (
                                <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                密码
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                                    errors.password ? 'border-red-300' : 'border-gray-300'
                                } rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                                value={formData.password}
                                onChange={handleChange}
                            />
                            {errors.password && (
                                <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                            )}
                        </div>
                    </div>

                    {loginError && (
                        <div className="text-red-600 text-sm text-center">
                            {loginError}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {isSubmitting ? '登录中...' : '登录'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
