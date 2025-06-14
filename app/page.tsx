'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Layout from "@/components/Layout";
import ContentCard from "@/components/ContentCard";
import { prisma } from "@/lib/prisma";
import { ContentType } from "@prisma/client";

export default function Home() {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  
  useEffect(() => {
    const fetchContents = async () => {
      try {
        const endpoint = activeTab === 'ALL' 
          ? '/api/contents?limit=6' 
          : `/api/contents?contentType=${activeTab}&limit=6`;
          
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error('Failed to fetch contents');
        }
        
        const data = await response.json();
        setContents(data.data);
      } catch (error) {
        console.error('Error fetching contents:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchContents();
  }, [activeTab]);
  
  const contentTypes = [
    { id: 'ALL', name: '全部', icon: '🔍' },
    { id: 'TEXT', name: '文本', icon: '📝' },
    { id: 'IMAGE', name: '图片', icon: '🖼️' },
    { id: 'MUSIC', name: '音乐', icon: '🎵' },
    { id: 'VIDEO', name: '视频', icon: '🎬' }
  ];
  
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-10 md:py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
              谁是人机
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            测试你识别AI生成内容的能力，挑战你的感知极限！
          </p>
          <div className="flex justify-center gap-4">
            <Link 
              href="/content/create" 
              className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-md"
            >
              开始挑战
            </Link>
            <Link 
              href="/content/create" 
              className="px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-full hover:bg-blue-50 transition-colors"
            >
              提交内容
            </Link>
          </div>
        </div>
      </section>
      
      {/* Content Type Navigation */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">浏览内容</h2>
        <div className="flex overflow-x-auto pb-2 gap-2">
          {contentTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setActiveTab(type.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                activeTab === type.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="mr-1">{type.icon}</span>
              {type.name}
            </button>
          ))}
        </div>
      </section>
      
      {/* Content List */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">最新内容</h2>
          <Link 
            href="/content" 
            className="text-blue-500 hover:underline flex items-center"
          >
            查看更多
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="ml-1">
              <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </Link>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : contents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contents.map((content) => (
              <Link href={`/content/${content.id}`} key={content.id} className="block transform hover:scale-[1.02] transition-transform">
                <ContentCard
                  id={content.id}
                  title={content.title}
                  contentType={content.contentType}
                  content={content.content}
                  isAI={content.isAI}
                />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-lg">没有找到内容</p>
            <Link href="/content/create" className="text-blue-500 hover:underline mt-2 inline-block">
              创建第一个内容
            </Link>
          </div>
        )}
      </section>
      
      {/* How It Works Section */}
      <section className="py-12 mt-10">
        <h2 className="text-2xl font-bold mb-6 text-center">参与方式</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🧠</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">猜测内容</h3>
            <p className="text-gray-600">查看文字、图片、音乐或视频内容，判断是AI生成还是人类创作</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🗳️</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">参与投票</h3>
            <p className="text-gray-600">用投票表达你的判断，看看你的直觉是否正确</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">查看结果</h3>
            <p className="text-gray-600">对比真实答案和集体智慧，提高你的人机识别能力</p>
          </div>
        </div>
      </section>
    </Layout>
  );
}