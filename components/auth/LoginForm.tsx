'use client';

import React, { useState } from 'react';
import { signIn } from '@/app/auth';

interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  redirectUrl?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onError,
  redirectUrl = '/',
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Clear error when user changes input
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    
    if (loginError) {
      setLoginError('');
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
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
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });
      
      if (result?.error) {
        const errorMessage = '登录失败：邮箱或密码不正确';
        setLoginError(errorMessage);
        if (onError) onError(errorMessage);
      } else {
        if (onSuccess) onSuccess();
        // If redirectUrl is provided by parent component, no need to do anything here
        // as the parent will handle the redirect
      }
    } catch (error) {
      console.error('登录时出错:', error);
      const errorMessage = '登录失败，请稍后再试';
      setLoginError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {loginError && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md border border-red-200">
          {loginError}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
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
        <div className="mb-6">
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
            placeholder="••••••••"
            disabled={isSubmitting}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">{errors.password}</p>
          )}
        </div>
        
        {/* Submit button */}
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:bg-blue-500"
          disabled={isSubmitting}
        >
          {isSubmitting ? '登录中...' : '登录'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
