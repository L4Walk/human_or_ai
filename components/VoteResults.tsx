'use client';

import { useState, useEffect } from 'react';

interface VoteResultsProps {
  contentId: string;
  initialAiVotes?: number;
  initialHumanVotes?: number;
  actualIsAI?: boolean;
  showActual?: boolean;
}

const VoteResults = ({
  contentId,
  initialAiVotes = 0,
  initialHumanVotes = 0,
  actualIsAI,
  showActual = false,
}: VoteResultsProps) => {
  const [aiVotes, setAiVotes] = useState(initialAiVotes);
  const [humanVotes, setHumanVotes] = useState(initialHumanVotes);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate percentages
  const totalVotes = aiVotes + humanVotes;
  const aiPercentage = totalVotes > 0 ? Math.round((aiVotes / totalVotes) * 100) : 0;
  const humanPercentage = totalVotes > 0 ? 100 - aiPercentage : 0;

  useEffect(() => {
    const fetchVotes = async () => {
      if (initialAiVotes > 0 || initialHumanVotes > 0) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/votes?contentId=${contentId}`);
        if (!response.ok) {
          throw new Error('获取投票数据失败');
        }
        
        const data = await response.json();
        setAiVotes(data.aiVotes);
        setHumanVotes(data.humanVotes);
      } catch (error) {
        console.error('加载投票结果出错:', error);
        setError('加载投票数据失败，请稍后再试。');
      } finally {
        setLoading(false);
      }
    };

    fetchVotes();
  }, [contentId, initialAiVotes, initialHumanVotes]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-16">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-2 rounded-md bg-red-50">
        {error}
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-center mb-2">投票结果</h3>
      
      <div className="flex justify-between items-center text-sm text-gray-600 mb-1">
        <span>AI生成</span>
        <span>{aiPercentage}%</span>
        <span>人类创作</span>
      </div>
      
      <div className="h-7 bg-gray-200 rounded-full overflow-hidden flex">
        <div 
          className="h-full bg-red-500 flex items-center justify-center text-xs text-white font-medium"
          style={{ width: `${aiPercentage}%` }}
        >
          {aiPercentage > 10 ? `${aiPercentage}%` : ''}
        </div>
        <div 
          className="h-full bg-blue-500 flex items-center justify-center text-xs text-white font-medium"
          style={{ width: `${humanPercentage}%` }}
        >
          {humanPercentage > 10 ? `${humanPercentage}%` : ''}
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-2 text-sm font-medium">
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1"></span>
          <span>AI ({aiVotes}票)</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-1"></span>
          <span>人类 ({humanVotes}票)</span>
        </div>
      </div>
      
      {showActual && actualIsAI !== undefined && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-center">
          <p className="font-medium">
            真相揭晓: 这是{actualIsAI ? 'AI生成' : '人类创作'}的内容
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {aiPercentage > 50 && actualIsAI || humanPercentage > 50 && !actualIsAI 
              ? '多数人猜对了！' 
              : '多数人猜错了！'}
          </p>
        </div>
      )}
    </div>
  );
};

export default VoteResults;
