'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface RegisterFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  redirectAfterSuccess?: boolean;
  redirectUrl?: string;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onError,
  redirectAfterSuccess = true,
  redirectUrl = '/login',
}) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Clear error when user changes input
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    
    if (registerError) {
      setRegisterError('');
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.name.trim()) {
      newErrors.name = '请输入用户名';
    }
    
    if (!formData.email) {
      newErrors.email = '请输入邮箱地址';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }
    
    if (!formData.password) {
      newErrors.password = '请输入密码';
    } else if (formData.password.length < 8) {
      newErrors.password = '密码长度至少为8个字符';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '请确认密码';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
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
    setRegisterError('');
    
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        const errorMessage = data.error || '注册失败，请稍后再试';
        setRegisterError(errorMessage);
        if (onError) onError(errorMessage);
      } else {
        setRegisterSuccess(true);
        if (onSuccess) onSuccess();
        
        if (redirectAfterSuccess) {
          // Redirect to login page after 2 seconds
          setTimeout(() => {
            router.push(redirectUrl);
          }, 2000);
        }
      }
    } catch (error) {
      console.error('注册时出错:', error);
      const errorMessage = '注册失败，请稍后再试';
      setRegisterError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {registerSuccess ? (
        <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-md border border-green-200 text-center">
          <p className="font-medium">注册成功！</p>
          {redirectAfterSuccess && (
            <p className="mt-1">即将跳转到登录页面...</p>
          )}
        </div>
      ) : (
        <>
          {registerError && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md border border-red-200">
              {registerError}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {/* Name field */}
            <div className="mb-4">
              <label htmlFor="name" className="block mb-2 font-medium text-gray-700">
                用户名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="您的用户名"
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>
            
            {/* Email field */}
            <div className="mb-4">
              <label htmlFor="email" className="block mb-2 font-medium text-gray-700">
                邮箱地址 <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="your@email.com"
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>
            
            {/* Password field */}
            <div className="mb-4">
              <label htmlFor="password" className="block mb-2 font-medium text-gray-700">
                密码 <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="至少8个字符"
                disabled={isSubmitting}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>
            
            {/* Confirm Password field */}
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block mb-2 font-medium text-gray-700">
                确认密码 <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="再次输入密码"
                disabled={isSubmitting}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>
            
            {/* Submit button */}
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:bg-blue-500"
              disabled={isSubmitting}
            >
              {isSubmitting ? '注册中...' : '注册'}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default RegisterForm;
