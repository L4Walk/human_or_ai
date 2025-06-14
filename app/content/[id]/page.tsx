'use client';

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Layout from "@/components/Layout";
import ContentCard from "@/components/ContentCard";
import VoteButtons from "@/components/VoteButtons";
import VoteResults from "@/components/VoteResults";
import { ContentType } from "@prisma/client";

interface Content {
  id: string;
  title: string;
  contentType: ContentType;
  content: string;
  isAI: boolean;
  createdAt: string;
  userId: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  votes: {
    id: string;
    vote: boolean;
    userId: string;
  }[];
}

export default function ContentPage() {
  const { id } = useParams() as { id: string };
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voted, setVoted] = useState(false);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/contents/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('内容不存在');
          }
          throw new Error('获取内容失败');
        }
        
        const data = await response.json();
        setContent(data);
        
        // Check if user has already voted
        if (data.votes && data.votes.length > 0) {
          setVoted(true);
          setShowResult(true);
        }
      } catch (error) {
        console.error('Error fetching content:', error);
        setError(error instanceof Error ? error.message : '加载失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchContent();
    }
  }, [id]);

  const handleVote = async (isAI: boolean) => {
    setVoted(true);
    setShowResult(true);
    
    // Reload content after vote to get updated statistics
    setTimeout(async () => {
      try {
        const response = await fetch(`/api/contents/${id}`);
        if (response.ok) {
          const updatedContent = await response.json();
          setContent(updatedContent);
        }
      } catch (error) {
        console.error('Error reloading content after vote:', error);
      }
    }, 500);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (error || !content) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-red-500 mb-4">出错了</h2>
          <p className="text-gray-600 mb-6">{error || '无法加载内容'}</p>
          <Link 
            href="/" 
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            返回首页
          </Link>
        </div>
      </Layout>
    );
  }

  // Calculate vote statistics
  const aiVotes = content.votes.filter(v => v.vote === true).length;
  const humanVotes = content.votes.filter(v => v.vote === false).length;
  const totalVotes = content.votes.length;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        {/* Navigation breadcrumb */}
        <div className="mb-6">
          <Link href="/" className="text-blue-500 hover:underline">
            首页
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-600">内容详情</span>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
          {/* Content display */}
          <ContentCard
            id={content.id}
            title={content.title}
            contentType={content.contentType}
            content={content.content}
            isAI={content.isAI}
            showResult={showResult}
          />
          
          {/* Challenge section */}
          {!showResult && (
            <div className="mt-8 p-6 bg-blue-50 rounded-lg">
              <h3 className="text-xl font-bold text-center mb-4">这是AI生成还是人类创作的？</h3>
              <p className="text-center text-gray-600 mb-4">根据你的判断，选择下方按钮进行投票</p>
              <VoteButtons 
                contentId={content.id} 
                onVote={handleVote} 
                disabled={voted} 
              />
            </div>
          )}
          
          {/* Results section */}
          {showResult && (
            <div className="mt-8">
              <VoteResults
                contentId={content.id}
                initialAiVotes={aiVotes}
                initialHumanVotes={humanVotes}
                actualIsAI={content.isAI}
                showActual={true}
              />
              
              <div className="mt-6 text-center">
                <Link
                  href="/"
                  className="inline-block px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  继续挑战更多内容
                </Link>
              </div>
            </div>
          )}
          
          {/* Creator info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                {content.user.image ? (
                  <img 
                    src={content.user.image} 
                    alt={content.user.name || '用户'} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span>👤</span>
                )}
              </div>
              <div className="ml-3">
                <p className="font-medium">{content.user.name || '匿名用户'}</p>
                <p className="text-sm text-gray-500">
                  发布于 {new Date(content.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
