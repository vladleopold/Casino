'use client';

import type { Route } from 'next';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();

  const languages = [
    { code: 'uk', label: 'Українська' },
    { code: 'en', label: 'English' },
    { code: 'ru', label: 'Русский' },
    { code: 'it', label: 'Italiano' },
  ];

  const getLocalizedPathname = (newLocale: string) => {
    if (!pathname) return `/${newLocale}`;
    
    // Remove current locale from path
    const segments = pathname.split('/');
    if (segments[1] === locale) {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }
    
    return segments.join('/');
  };

  return (
    <div className="language-switcher">
      {languages.map((lang) => (
        <Link
          key={lang.code}
          href={getLocalizedPathname(lang.code) as Route}
          className={`language-switcher__btn ${locale === lang.code ? 'is-active' : ''}`}
        >
          {lang.label}
        </Link>
      ))}
    </div>
  );
}
