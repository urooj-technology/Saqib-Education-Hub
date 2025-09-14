"use client";

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function I18nProvider({ children }) {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Initialize i18n on the client side
    import('../i18n');
  }, []);

  return children;
}
