import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export function Header() {
  const { t, language, setLanguage } = useLanguage();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo/Title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('app.title')}</h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'he' ? 'en' : 'he')}
            className="px-3 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            {language === 'he' ? 'EN' : 'עברית'}
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                R
              </div>
            </button>

            {isUserMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200">
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
                  {t('nav.settings')}
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-200">
                  {t('nav.logout')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export function Sidebar() {
  const { t, dir } = useLanguage();
  const [isOpen, setIsOpen] = useState(true);

  const menuItems = [
    { key: 'nav.appointments', icon: '📅', href: '/appointments' },
    { key: 'nav.staff', icon: '👥', href: '/staff' },
    { key: 'nav.hours', icon: '🕐', href: '/hours' },
    { key: 'nav.settings', icon: '⚙️', href: '/settings' },
  ];

  return (
    <aside
      className={`${
        isOpen ? 'w-64' : 'w-20'
      } bg-gray-900 text-white transition-all duration-300 min-h-screen`}
      dir={dir}
    >
      <div className="p-6 flex items-center justify-between">
        {isOpen && <h2 className="text-xl font-bold">Barber Pro</h2>}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 hover:bg-gray-800 rounded"
        >
          {isOpen ? '←' : '→'}
        </button>
      </div>

      <nav className="mt-8">
        {menuItems.map((item) => (
          <a
            key={item.key}
            href={item.href}
            className="flex items-center gap-3 px-6 py-3 hover:bg-gray-800 transition text-gray-100"
          >
            <span className="text-xl">{item.icon}</span>
            {isOpen && <span className="text-sm">{t(item.key)}</span>}
          </a>
        ))}
      </nav>
    </aside>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { dir } = useLanguage();

  return (
    <div dir={dir} className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
