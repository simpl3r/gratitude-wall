'use client';

import { OnchainKitProvider } from '@coinbase/onchainkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { base } from 'wagmi/chains';
import { WagmiProvider } from 'wagmi';
import { http, createConfig } from 'wagmi';
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors';
import { ReactNode } from 'react';
import { detectEnvironment } from '@/utils/environment';

// Создаем конфигурацию с учетом среды выполнения
function createWagmiConfig() {
  const env = detectEnvironment();
  const connectors = [];

  // Coinbase Wallet - основной коннектор для всех сред
  connectors.push(
    coinbaseWallet({
      appName: 'Gratitude Wall',
      preference: env.isFarcaster || env.isBaseApp ? 'smartWalletOnly' : 'all',
    })
  );

  // Добавляем дополнительные коннекторы для обычного веба
  if (env.isWeb) {
    // Injected wallet (MetaMask, etc.)
    connectors.push(injected({ shimDisconnect: true }));
    
    // WalletConnect для мобильных кошельков
    connectors.push(
      walletConnect({
        projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo',
        metadata: {
          name: 'Gratitude Wall',
          description: 'Share what you are grateful for every day on Base blockchain',
          url: typeof window !== 'undefined' ? window.location.origin : 'https://gratitude-wall.vercel.app',
          icons: ['/icon-512.png'],
        },
      })
    );
  }

  return createConfig({
    chains: [base],
    connectors,
    transports: {
      [base.id]: http(),
    },
    multiInjectedProviderDiscovery: !env.isFarcaster && !env.isBaseApp,
  });
}

const config = createWagmiConfig();

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          chain={base}
        >
          {children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}