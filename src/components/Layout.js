'use client';

import { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';

// Import translations
import enTranslations from '../locales/en.json';
import psTranslations from '../locales/ps.json';
import drTranslations from '../locales/dr.json';

const translations = {
  en: enTranslations,
  ps: psTranslations,
  dr: drTranslations,
};

export default function Layout({ children }) {
  const [currentLang, setCurrentLang] = useState('en');

  useEffect(() => {
    // Load language preference from localStorage
    const savedLang = localStorage.getItem('language');
    if (savedLang && translations[savedLang]) {
      setCurrentLang(savedLang);
    }
  }, []);

  const handleLanguageChange = (langCode) => {
    setCurrentLang(langCode);
    localStorage.setItem('language', langCode);
  };

  const currentTranslations = translations[currentLang] || translations.en;

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        translations={currentTranslations} 
        currentLang={currentLang} 
        onLanguageChange={handleLanguageChange} 
      />
      <main className="flex-1">
        {children}
      </main>
      <Footer translations={currentTranslations} />
    </div>
  );
} 