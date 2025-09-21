# 🙏 Gratitude Wall - Base Mini App

Гратитуд Волл - это мини-приложение для Base App, которое позволяет пользователям делиться тем, за что они благодарны каждый день, с подтверждением транзакций в блокчейне Base.

## ✨ Особенности

- 📱 **Mini App для Base App** - работает внутри Base App
- 🔗 **Интеграция с блокчейном** - каждый чекин записывается в смарт-контракт на Base
- 💰 **Smart Wallet** - использует Coinbase Smart Wallet
- 🎨 **Современный UI** - красивый интерфейс с Tailwind CSS
- ⚡ **OnchainKit** - интеграция с компонентами Coinbase

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
cd gratitude-wall
npm install
```

### 2. Настройка переменных окружения

```bash
cp .env.example .env.local
```

Отредактируйте `.env.local` и добавьте ваш OnchainKit API ключ:

```env
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_api_key_here
```

Получить API ключ можно на [Coinbase Developer Platform](https://portal.cdp.coinbase.com/)

### 3. Запуск приложения

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## 🏗️ Архитектура

### Frontend
- **Next.js 15** с App Router
- **TypeScript** для типизации
- **Tailwind CSS** для стилей
- **MiniKit** для интеграции с Base App
- **OnchainKit** для блокчейн компонентов
- **Wagmi** для взаимодействия с Ethereum

### Smart Contract
- **Адрес контракта**: `0x61026a5CF6F7F83cc6C622B1bBA7B3a4827b8026`
- **Сеть**: Base Mainnet
- **Функция**: `checkIn(bytes32 messageHash)` - записывает хеш сообщения благодарности

## 📱 Как использовать

1. **Подключите кошелек** - используйте Coinbase Smart Wallet
2. **Напишите благодарность** - поделитесь тем, за что вы благодарны (до 280 символов)
3. **Сделайте чекин** - подтвердите транзакцию в блокчейне Base
4. **Поделитесь** - опубликуйте в Farcaster (будет добавлено позже)

## 🔧 Технические детали

### Структура проекта

```
gratitude-wall/
├── src/
│   ├── app/
│   │   ├── globals.css      # Глобальные стили
│   │   ├── layout.tsx       # Основной layout
│   │   ├── page.tsx         # Главная страница
│   │   └── providers.tsx    # Провайдеры (Wagmi, OnchainKit)
├── public/
│   └── manifest.json        # Манифест Mini App
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

### Интеграция с блокчейном

Приложение использует смарт-контракт для записи хешей сообщений благодарности:

```solidity
function checkIn(bytes32 messageHash) external {
    // Логика записи чекина
}
```

## 🚀 Деплой

### Vercel (рекомендуется)

1. Подключите репозиторий к Vercel
2. Добавьте переменные окружения
3. Деплойте

### Другие платформы

```bash
npm run build
npm run start
```

## 🔮 Планы развития

- [ ] Интеграция с Farcaster для автоматической публикации
- [ ] Стена благодарностей с историей
- [ ] NFT для особых достижений
- [ ] Система стрейков (ежедневные чекины)
- [ ] Социальные функции (лайки, комментарии)

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции
3. Внесите изменения
4. Создайте Pull Request

## 📄 Лицензия

MIT License

## 🔗 Полезные ссылки

- [Base Docs](https://docs.base.org/)
- [OnchainKit](https://onchainkit.xyz/)
- [MiniKit Documentation](https://docs.base.org/mini-apps/)
- [Coinbase Developer Platform](https://portal.cdp.coinbase.com/)