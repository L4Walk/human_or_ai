'use client';

import { useState } from 'react';

interface VoteButtonsProps {
  contentId: string;
  onVote?: (isAI: boolean) => void;
  disabled?: boolean;
}

const VoteButtons = ({ contentId, onVote, disabled = false }: VoteButtonsProps) => {
  const [isVoting, setIsVoting] = useState(false);
  const [voted, setVoted] = useState(false);

  const handleVote = async (isAI: boolean) => {
    if (disabled || isVoting || voted) return;
    
    setIsVoting(true);
    
    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentId,
          vote: isAI,
        }),
      });

      if (response.ok) {
        setVoted(true);
        if (onVote) onVote(isAI);
      } else {
        throw new Error('投票失败');
      }
    } catch (error) {
      console.error('投票出错:', error);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full mt-4">
      <button
        onClick={() => handleVote(true)}
        disabled={disabled || isVoting || voted}
        className={`flex-1 py-3 px-6 rounded-full text-white font-medium transition-all 
          ${
            voted 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-red-500 hover:bg-red-600 active:scale-95 shadow-md hover:shadow-lg'
          }`}
      >
        <div className="flex items-center justify-center gap-2">
          <span className="text-xl">🤖</span>
          <span>我是人机!</span>
        </div>
      </button>
      
      <button
        onClick={() => handleVote(false)}
        disabled={disabled || isVoting || voted}
        className={`flex-1 py-3 px-6 rounded-full text-white font-medium transition-all 
          ${
            voted 
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 active:scale-95 shadow-md hover:shadow-lg'
          }`}
      >
        <div className="flex items-center justify-center gap-2">
          <span className="text-xl">👤</span>
          <span>包真人的!</span>
        </div>
      </button>
      
      {isVoting && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {voted && (
        <div className="mt-2 text-center text-green-600 font-medium">
          投票已记录，谢谢参与！
        </div>
      )}
    </div>
  );
};

export default VoteButtons;
