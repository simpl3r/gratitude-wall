'use client';

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ConnectWallet, Wallet } from '@coinbase/onchainkit/wallet';
import { Avatar, Name } from '@coinbase/onchainkit/identity';
import { base } from 'wagmi/chains';
import { FarcasterShare } from '@/components/FarcasterShare';
import { useAutoWallet } from '@/hooks/useAutoWallet';

const CONTRACT_ADDRESS = '0x61026a5CF6F7F83cc6C622B1bBA7B3a4827b8026';

// ABI для функции checkIn
const CONTRACT_ABI = [
  {
    inputs: [{ name: 'messageHash', type: 'bytes32' }],
    name: 'checkIn',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export default function Home() {
  const [gratitude, setGratitude] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFarcasterShare, setShowFarcasterShare] = useState(false);
  const [submittedGratitude, setSubmittedGratitude] = useState('');
  const { 
    address, 
    isConnected, 
    isAutoConnecting, 
    environment, 
    shouldShowConnectButton,
    connect: manualConnect 
  } = useAutoWallet();
  
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });

  // Создаем хеш из текста благодарности
  const createMessageHash = (message: string): `0x${string}` => {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    return `0x${Array.from(data).map(b => b.toString(16).padStart(2, '0')).join('').padEnd(64, '0').slice(0, 64)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gratitude.trim() || !isConnected) return;
    
    setIsSubmitting(true);
    try {
      const messageHash = createMessageHash(gratitude);
      
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'checkIn',
        args: [messageHash],
        chain: base,
      });
    } catch (err) {
      console.error('Error submitting:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setGratitude('');
    setSubmittedGratitude('');
  };

  const handleShareToFarcaster = () => {
    if (hash && gratitude) {
      setSubmittedGratitude(gratitude);
      setShowFarcasterShare(true);
    }
  };

  const closeFarcasterShare = () => {
    setShowFarcasterShare(false);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🙏 Gratitude Wall</h1>
          <p className="text-gray-600">Share what you're grateful for today on Base</p>
        </div>

        {/* Wallet Connection */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          {/* Environment Info */}
          {(environment.isFarcaster || environment.isBaseApp) && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-blue-600">
                  {environment.isFarcaster ? '🟣' : '🔵'}
                </span>
                <span className="text-sm font-medium text-blue-800">
                  Running in {environment.isFarcaster ? 'Farcaster' : 'Base App'}
                </span>
              </div>
            </div>
          )}

          {isAutoConnecting ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
              <p className="text-gray-600">Connecting wallet automatically...</p>
            </div>
          ) : isConnected ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {address && <Avatar address={address} className="w-10 h-10" />}
                <div>
                  {address && <Name address={address} className="font-semibold" />}
                  <p className="text-sm text-gray-500">
                    Connected to Base
                    {environment.isFarcaster && ' via Farcaster'}
                    {environment.isBaseApp && ' via Base App'}
                  </p>
                </div>
              </div>
              <Wallet>
                <ConnectWallet className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
                  Wallet
                </ConnectWallet>
              </Wallet>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                {environment.isFarcaster || environment.isBaseApp 
                  ? 'Wallet connection required' 
                  : 'Connect your wallet to start sharing gratitude'
                }
              </p>
              {shouldShowConnectButton && (
                <div className="space-y-3">
                  <Wallet>
                    <ConnectWallet className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold">
                      Connect Wallet
                    </ConnectWallet>
                  </Wallet>
                  {(environment.isFarcaster || environment.isBaseApp) && (
                    <button
                      onClick={manualConnect}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold"
                    >
                      Try Auto-Connect
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Gratitude Form */}
        {isConnected && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="gratitude" className="block text-sm font-medium text-gray-700 mb-2">
                  What are you grateful for today?
                </label>
                <textarea
                  id="gratitude"
                  value={gratitude}
                  onChange={(e) => setGratitude(e.target.value)}
                  placeholder="I'm grateful for..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                  maxLength={280}
                  required
                />
                <div className="text-right text-sm text-gray-500 mt-1">
                  {gratitude.length}/280
                </div>
              </div>
              
              <button
                type="submit"
                disabled={!gratitude.trim() || isPending || isConfirming || isSubmitting}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isPending || isConfirming || isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isPending ? 'Confirming...' : isConfirming ? 'Processing...' : 'Submitting...'}
                  </span>
                ) : (
                  '✨ Check In & Share Gratitude'
                )}
              </button>
            </form>

            {/* Transaction Status */}
            {hash && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  Transaction: <a href={`https://basescan.org/tx/${hash}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">{hash.slice(0, 10)}...{hash.slice(-8)}</a>
                </p>
              </div>
            )}
            
            {isConfirmed && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <p className="text-green-800 font-semibold">🎉 Gratitude shared successfully!</p>
                <div className="mt-3 flex space-x-3">
                  <button
                    onClick={handleShareToFarcaster}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                  >
                    🚀 Share to Farcaster
                  </button>
                  <button
                    onClick={resetForm}
                    className="text-sm text-green-600 hover:text-green-800 underline"
                  >
                    Share another gratitude
                  </button>
                </div>
              </div>
            )}
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg">
                <p className="text-red-800">Error: {error.message}</p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Built on Base • Powered by OnchainKit</p>
        </div>
      </div>

      {/* Farcaster Share Modal */}
      {showFarcasterShare && hash && (
        <FarcasterShare
          gratitudeText={submittedGratitude}
          transactionHash={hash}
          onClose={closeFarcasterShare}
        />
      )}
    </div>
  );
}