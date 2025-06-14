'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ContentType } from '@prisma/client';

interface ContentCardProps {
  id: string;
  title: string;
  contentType: ContentType;
  content: string;
  isAI: boolean;
  showResult?: boolean;
}

const ContentCard = ({
  id,
  title,
  contentType,
  content,
  isAI,
  showResult = false,
}: ContentCardProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  
  const renderContent = () => {
    switch (contentType) {
      case 'TEXT':
        return (
          <div className="p-4 bg-gray-50 rounded-lg shadow-inner">
            <p className="text-gray-800 whitespace-pre-line">{content}</p>
          </div>
        );
      case 'IMAGE':
        return (
          <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden">
            <Image
              src={content}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        );
      case 'MUSIC':
        return (
          <div className="w-full">
            <audio
              src={content}
              controls
              className="w-full"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            <div className="mt-2 flex items-center">
              <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-300'} mr-2`}></div>
              <span className="text-sm text-gray-500">{isPlaying ? '正在播放' : '暂停'}</span>
            </div>
          </div>
        );
      case 'VIDEO':
        return (
          <div className="w-full rounded-lg overflow-hidden">
            <video
              src={content}
              controls
              className="w-full"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          </div>
        );
      default:
        return <div>不支持的内容类型</div>;
    }
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-md overflow-hidden mb-6">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
            {contentType}
          </span>
        </div>

        <div className="mb-4">
          {renderContent()}
        </div>

        {showResult && (
          <div className="bg-gray-50 p-3 rounded-lg mt-4">
            <p className="text-center text-sm">
              这是{isAI ? 'AI生成' : '人类创作'}的内容
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentCard;
