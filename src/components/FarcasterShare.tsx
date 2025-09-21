'use client';

import { useState, useEffect } from 'react';
import { detectEnvironment } from '@/utils/environment';

interface FarcasterShareProps {
  gratitudeText: string;
  transactionHash: string;
  onClose: () => void;
}

export function FarcasterShare({ gratitudeText, transactionHash, onClose }: FarcasterShareProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [environment, setEnvironment] = useState(detectEnvironment());

  useEffect(() => {
    setEnvironment(detectEnvironment());
  }, []);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      // Создаем текст для поста в Farcaster
      const postText = `🙏 Today I'm grateful for: ${gratitudeText}\n\n#GratitudeWall #Base #OnChain`;
      const embedUrl = `https://basescan.org/tx/${transactionHash}`;
      
      // Проверяем среду выполнения и используем соответствующий метод
      if (environment.isFarcaster && (window as any).sdk?.actions?.composeCast) {
        // Используем Farcaster Mini App SDK
        await (window as any).sdk.actions.composeCast({
          text: postText,
          embeds: [embedUrl]
        });
        setShareSuccess(true);
      } else if (environment.isBaseApp && (window as any).base?.share) {
        // Используем Base App sharing API
        await (window as any).base.share({
          text: postText,
          url: embedUrl
        });
        setShareSuccess(true);
      } else if (navigator.share) {
        // Используем Web Share API если доступен
        await navigator.share({
          title: 'My Gratitude',
          text: postText,
          url: embedUrl
        });
        setShareSuccess(true);
      } else {
        // Fallback: открываем Warpcast с предзаполненным текстом
        const warpcastUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(postText)}&embeds[]=${encodeURIComponent(embedUrl)}`;
        window.open(warpcastUrl, '_blank');
        setShareSuccess(true);
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // В случае ошибки все равно открываем Warpcast
      const postText = `🙏 Today I'm grateful for: ${gratitudeText}\n\n#GratitudeWall #Base #OnChain`;
      const embedUrl = `https://basescan.org/tx/${transactionHash}`;
      const warpcastUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(postText)}&embeds[]=${encodeURIComponent(embedUrl)}`;
      window.open(warpcastUrl, '_blank');
      setShareSuccess(true);
    } finally {
      setIsSharing(false);
    }
  };

  if (shareSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <div className="text-center">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Shared to Farcaster!
            </h3>
            <p className="text-gray-600 mb-4">
              Your gratitude has been shared with the community.
            </p>
            <button
              onClick={onClose}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Share to Farcaster
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-4">
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600 mb-2">Preview:</p>
            <p className="text-gray-800">
              🙏 Today I'm grateful for: <strong>{gratitudeText}</strong>
            </p>
            <p className="text-sm text-blue-600 mt-2">
              #GratitudeWall #Base #OnChain
            </p>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              📎 Transaction: {transactionHash.slice(0, 10)}...{transactionHash.slice(-8)}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-semibold"
          >
            Skip
          </button>
          <button
            onClick={handleShare}
            disabled={isSharing}
            className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSharing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sharing...
              </span>
            ) : (
              '🚀 Share'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}