'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from "@/components/Layout";
import { ContentType } from "@prisma/client";
import { auth } from "@/app/auth";

type FormState = {
  title: string;
  contentType: ContentType;
  content: string;
  isAI: boolean;
};

export default function CreateContent() {
  const router = useRouter();
  const [formState, setFormState] = useState<FormState>({
    title: '',
    contentType: 'TEXT' as ContentType,
    content: '',
    isAI: false,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getUserSession() {
      try {
        const session = await auth();
        if (session?.user) {
          setUser(session.user);
        } else {
          // Redirect to login if no user is found
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching user session:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    getUserSession();
  }, [router]);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    // Clear error when user changes input
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    if (name === 'isAI') {
      setFormState(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormState(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle file uploads
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Reset content field when file uploaded
    setFormState(prev => ({ ...prev, content: '' }));
    setUploadedFile(file);
    
    // Create preview for image files
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  // Clear file selection
  const handleClearFile = () => {
    setUploadedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formState.title.trim()) {
      newErrors.title = '标题不能为空';
    }
    
    if (formState.contentType === 'TEXT' && !formState.content.trim() && !uploadedFile) {
      newErrors.content = '内容不能为空';
    }
    
    if (formState.contentType !== 'TEXT' && !uploadedFile && !formState.content) {
      newErrors.file = `请上传${
        formState.contentType === 'IMAGE' ? '图片' : 
        formState.contentType === 'MUSIC' ? '音乐' : '视频'
      }文件`;
    }
    
    if (!user) {
      newErrors.user = '您需要登录才能创建内容';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      let contentUrl = formState.content;
      
      // If there's a file uploaded, handle file upload first
      if (uploadedFile) {
        const formData = new FormData();
        formData.append('file', uploadedFile);
        
        // In a real app, you would upload to your file storage service here
        // and get back a URL. For this example, we'll create a data URL.
        const reader = new FileReader();
        contentUrl = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(uploadedFile);
        });
      }
      
      // Create the content via API
      const response = await fetch('/api/contents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formState.title,
          contentType: formState.contentType,
          content: contentUrl,
          isAI: formState.isAI,
          userId: user.id,
        }),
      });
      
      if (!response.ok) {
        throw new Error('创建内容失败');
      }
      
      const createdContent = await response.json();
      
      // Redirect to the created content page
      router.push(`/content/${createdContent.id}`);
    } catch (error) {
      console.error('提交表单时出错:', error);
      setErrors(prev => ({ ...prev, submit: '提交失败，请稍后再试' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get appropriate file accept attributes based on content type
  const getFileAcceptType = () => {
    switch (formState.contentType) {
      case 'IMAGE': return 'image/*';
      case 'MUSIC': return 'audio/*';
      case 'VIDEO': return 'video/*';
      default: return '';
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-gray-600">加载中...</span>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="max-w-md mx-auto text-center py-12">
          <h2 className="text-xl font-semibold mb-4">需要登录</h2>
          <p className="text-gray-600 mb-6">您需要登录才能创建内容</p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            去登录
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">创建新内容</h1>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <form onSubmit={handleSubmit}>
            {/* Title field */}
            <div className="mb-6">
              <label htmlFor="title" className="block mb-2 font-medium text-gray-700">
                标题 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formState.title}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="输入内容标题"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">{errors.title}</p>
              )}
            </div>
            
            {/* Content type selector */}
            <div className="mb-6">
              <label htmlFor="contentType" className="block mb-2 font-medium text-gray-700">
                内容类型 <span className="text-red-500">*</span>
              </label>
              <select
                id="contentType"
                name="contentType"
                value={formState.contentType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="TEXT">文字</option>
                <option value="IMAGE">图片</option>
                <option value="MUSIC">音乐</option>
                <option value="VIDEO">视频</option>
              </select>
            </div>
            
            {/* Content field or file upload based on content type */}
            {formState.contentType === 'TEXT' ? (
              <div className="mb-6">
                <label htmlFor="content" className="block mb-2 font-medium text-gray-700">
                  内容 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formState.content}
                  onChange={handleChange}
                  rows={8}
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none ${
                    errors.content ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="输入文字内容"
                ></textarea>
                {errors.content && (
                  <p className="mt-1 text-sm text-red-500">{errors.content}</p>
                )}
              </div>
            ) : (
              <div className="mb-6">
                <label className="block mb-2 font-medium text-gray-700">
                  上传{
                    formState.contentType === 'IMAGE' ? '图片' : 
                    formState.contentType === 'MUSIC' ? '音乐' : '视频'
                  } <span className="text-red-500">*</span>
                </label>
                
                <div className={`border-2 border-dashed rounded-lg p-4 text-center ${
                  errors.file ? 'border-red-500' : 'border-gray-300'
                }`}>
                  {!uploadedFile ? (
                    <div>
                      <input
                        type="file"
                        id="file"
                        name="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept={getFileAcceptType()}
                        className="hidden"
                      />
                      <label htmlFor="file" className="cursor-pointer text-blue-500 hover:text-blue-600">
                        <div className="flex flex-col items-center justify-center py-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <span className="text-sm font-medium">点击上传文件</span>
                          <span className="text-xs text-gray-500 mt-1">或拖放文件到此处</span>
                        </div>
                      </label>
                    </div>
                  ) : (
                    <div className="py-2">
                      {previewUrl && formState.contentType === 'IMAGE' && (
                        <div className="relative w-full h-48 mb-3">
                          <img
                            src={previewUrl}
                            alt="预览"
                            className="object-contain w-full h-full"
                          />
                        </div>
                      )}
                      
                      {formState.contentType === 'MUSIC' && (
                        <audio
                          controls
                          className="w-full mb-3"
                          src={URL.createObjectURL(uploadedFile)}
                        />
                      )}
                      
                      {formState.contentType === 'VIDEO' && (
                        <video
                          controls
                          className="w-full mb-3 max-h-48"
                          src={URL.createObjectURL(uploadedFile)}
                        />
                      )}
                      
                      <div className="flex items-center justify-center">
                        <span className="text-sm mr-2 text-gray-700 truncate max-w-[200px]">
                          {uploadedFile.name}
                        </span>
                        <button
                          type="button"
                          onClick={handleClearFile}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {errors.file && (
                  <p className="mt-1 text-sm text-red-500">{errors.file}</p>
                )}
                
                {/* Alternative URL input for non-text content */}
                <div className="mt-3">
                  <label htmlFor="content" className="block mb-2 text-sm text-gray-600">
                    或者提供{
                      formState.contentType === 'IMAGE' ? '图片' : 
                      formState.contentType === 'MUSIC' ? '音乐' : '视频'
                    }URL地址
                  </label>
                  <input
                    type="text"
                    id="content"
                    name="content"
                    value={formState.content}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder={`输入${
                      formState.contentType === 'IMAGE' ? '图片' : 
                      formState.contentType === 'MUSIC' ? '音乐' : '视频'
                    }URL地址`}
                  />
                </div>
              </div>
            )}
            
            {/* Is AI toggle */}
            <div className="mb-8">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isAI"
                  name="isAI"
                  checked={formState.isAI}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isAI" className="ml-2 text-gray-700">
                  这是AI生成的内容
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                请如实标记内容来源，帮助其他用户练习辨别能力
              </p>
            </div>
            
            {/* Submit error message */}
            {errors.submit && (
              <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-md">
                {errors.submit}
              </div>
            )}
            
            {/* Submit button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span>提交中...</span>
                  </div>
                ) : (
                  '发布内容'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}