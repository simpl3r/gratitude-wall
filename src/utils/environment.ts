/**
 * Утилиты для детекции среды выполнения приложения
 */

export interface EnvironmentInfo {
  isFarcaster: boolean;
  isBaseApp: boolean;
  isWeb: boolean;
  userAgent: string;
  hasWallet: boolean;
}

/**
 * Определяет среду выполнения приложения
 */
export function detectEnvironment(): EnvironmentInfo {
  if (typeof window === 'undefined') {
    return {
      isFarcaster: false,
      isBaseApp: false,
      isWeb: false,
      userAgent: '',
      hasWallet: false,
    };
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  const hasEthereum = typeof (window as any).ethereum !== 'undefined';
  const hasFarcasterSDK = typeof (window as any).sdk !== 'undefined';
  const hasBaseSDK = typeof (window as any).base !== 'undefined';
  
  // Детекция Farcaster Mini App
  const isFarcaster = 
    hasFarcasterSDK ||
    userAgent.includes('farcaster') ||
    userAgent.includes('warpcast') ||
    window.location.hostname.includes('warpcast.com') ||
    (window as any).parent !== window; // Проверка на iframe

  // Детекция Base App
  const isBaseApp = 
    hasBaseSDK ||
    userAgent.includes('base') ||
    userAgent.includes('coinbase') ||
    window.location.hostname.includes('base.org') ||
    window.location.hostname.includes('coinbase.com');

  // Обычный веб-браузер
  const isWeb = !isFarcaster && !isBaseApp;

  return {
    isFarcaster,
    isBaseApp,
    isWeb,
    userAgent,
    hasWallet: hasEthereum,
  };
}

/**
 * Получает предпочтительный способ подключения кошелька для текущей среды
 */
export function getWalletConnectionStrategy(): 'auto' | 'manual' | 'embedded' {
  const env = detectEnvironment();
  
  if (env.isFarcaster) {
    return 'embedded'; // В Farcaster кошелек уже подключен
  }
  
  if (env.isBaseApp) {
    return 'auto'; // В Base App автоматически подключаем
  }
  
  return 'manual'; // В обычном браузере пользователь подключает вручную
}

/**
 * Проверяет, доступен ли автоматический вход в кошелек
 */
export function canAutoConnectWallet(): boolean {
  const env = detectEnvironment();
  return env.isFarcaster || env.isBaseApp;
}

/**
 * Получает информацию о кошельке из среды выполнения
 */
export async function getEmbeddedWalletInfo(): Promise<{
  address?: string;
  isConnected: boolean;
  provider?: any;
}> {
  const env = detectEnvironment();
  
  if (env.isFarcaster && (window as any).sdk?.wallet) {
    try {
      const wallet = (window as any).sdk.wallet;
      const address = await wallet.getAddress();
      return {
        address,
        isConnected: !!address,
        provider: wallet,
      };
    } catch (error) {
      console.warn('Failed to get Farcaster wallet info:', error);
    }
  }
  
  if (env.isBaseApp && (window as any).base?.wallet) {
    try {
      const wallet = (window as any).base.wallet;
      const address = await wallet.getAddress();
      return {
        address,
        isConnected: !!address,
        provider: wallet,
      };
    } catch (error) {
      console.warn('Failed to get Base App wallet info:', error);
    }
  }
  
  return {
    isConnected: false,
  };
}