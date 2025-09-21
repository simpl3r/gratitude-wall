'use client';

import { useEffect, useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { detectEnvironment, getEmbeddedWalletInfo, canAutoConnectWallet } from '@/utils/environment';

export interface AutoWalletState {
  isAutoConnecting: boolean;
  autoConnectAttempted: boolean;
  environment: ReturnType<typeof detectEnvironment>;
  embeddedWallet?: {
    address?: string;
    isConnected: boolean;
    provider?: any;
  };
}

/**
 * Хук для автоматического подключения кошелька в зависимости от среды
 */
export function useAutoWallet() {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  
  const [state, setState] = useState<AutoWalletState>({
    isAutoConnecting: false,
    autoConnectAttempted: false,
    environment: detectEnvironment(),
    embeddedWallet: undefined,
  });

  // Автоматическое подключение при загрузке
  useEffect(() => {
    const attemptAutoConnect = async () => {
      if (state.autoConnectAttempted || isConnected) {
        return;
      }

      const env = detectEnvironment();
      setState(prev => ({ ...prev, environment: env, isAutoConnecting: true }));

      try {
        // Проверяем встроенный кошелек в Mini Apps
        if (canAutoConnectWallet()) {
          const embeddedWallet = await getEmbeddedWalletInfo();
          setState(prev => ({ ...prev, embeddedWallet }));

          if (embeddedWallet.isConnected) {
            // Если встроенный кошелек уже подключен, используем его
            console.log('Using embedded wallet:', embeddedWallet.address);
            return;
          }
        }

        // Автоматическое подключение через Coinbase Wallet для Base App
        if (env.isBaseApp || env.isFarcaster) {
          const coinbaseConnector = connectors.find(
            connector => connector.name.toLowerCase().includes('coinbase')
          );
          
          if (coinbaseConnector) {
            await connect({ connector: coinbaseConnector });
          }
        }
      } catch (error) {
        console.warn('Auto-connect failed:', error);
      } finally {
        setState(prev => ({
          ...prev,
          isAutoConnecting: false,
          autoConnectAttempted: true,
        }));
      }
    };

    // Небольшая задержка для инициализации среды
    const timer = setTimeout(attemptAutoConnect, 500);
    return () => clearTimeout(timer);
  }, [isConnected, connect, connectors, state.autoConnectAttempted]);

  // Функция для ручного подключения
  const manualConnect = async () => {
    try {
      const coinbaseConnector = connectors.find(
        connector => connector.name.toLowerCase().includes('coinbase')
      );
      
      if (coinbaseConnector) {
        await connect({ connector: coinbaseConnector });
      }
    } catch (error) {
      console.error('Manual connect failed:', error);
      throw error;
    }
  };

  // Функция для отключения
  const handleDisconnect = async () => {
    try {
      await disconnect();
      setState(prev => ({
        ...prev,
        embeddedWallet: undefined,
        autoConnectAttempted: false,
      }));
    } catch (error) {
      console.error('Disconnect failed:', error);
      throw error;
    }
  };

  return {
    // Состояние подключения
    isConnected: isConnected || state.embeddedWallet?.isConnected || false,
    address: address || state.embeddedWallet?.address,
    
    // Состояние автоподключения
    isAutoConnecting: state.isAutoConnecting,
    autoConnectAttempted: state.autoConnectAttempted,
    
    // Информация о среде
    environment: state.environment,
    embeddedWallet: state.embeddedWallet,
    
    // Функции управления
    connect: manualConnect,
    disconnect: handleDisconnect,
    
    // Утилиты
    canAutoConnect: canAutoConnectWallet(),
    shouldShowConnectButton: !state.isAutoConnecting && 
                           !isConnected && 
                           !state.embeddedWallet?.isConnected &&
                           state.autoConnectAttempted,
  };
}