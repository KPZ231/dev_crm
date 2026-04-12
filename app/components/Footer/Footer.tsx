'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Shield, FileText, Cookie, Terminal } from 'lucide-react';

const GithubIcon = ({ size = 18 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const XIcon = ({ size = 18 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
  </svg>
);

const LinkedInIcon = ({ size = 18 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const footerLinks = {
  product: [
    { label: 'Funkcje', href: '/#features' },
    { label: 'Cennik', href: '/#pricing' },
    { label: 'Demo', href: '/demo' },
  ],
  firma: [
    { label: 'O nas', href: '/about' },
    { label: 'Kontakt', href: '/contact' },
    { label: 'Kariera', href: '/careers' },
  ],
  prawne: [
    { label: 'Polityka prywatności', href: '/privacy', icon: <Shield size={14} /> },
    { label: 'Regulamin', href: '/terms', icon: <FileText size={14} /> },
    { label: 'Polityka cookies', href: '/cookies', icon: <Cookie size={14} /> },
  ],
};

const socialLinks = [
  { label: 'GitHub', href: 'https://github.com', icon: <GithubIcon size={18} /> },
  { label: 'X', href: 'https://x.com', icon: <XIcon size={18} /> },
  { label: 'LinkedIn', href: 'https://linkedin.com', icon: <LinkedInIcon size={18} /> },
  { label: 'Email', href: 'mailto:contact@devcrm.pl', icon: <Mail size={18} /> },
];

export default function Footer() {
  return (
    <footer className="bg-[#0c0c0f] border-t border-[#27272a]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/dashboard" className="flex items-center gap-2 mb-4 group w-fit">
              <div className="w-8 h-8 rounded-md bg-[#a78bfa] flex items-center justify-center text-[#09090b] font-bold transition-transform group-hover:scale-105">
                <Terminal size={18} strokeWidth={2.5} />
              </div>
              <span className="text-[#fafafa] font-bold tracking-tight text-lg flex items-center">
                Dev<span className="text-[#a78bfa]">CRM</span>
                <span className="w-1.5 h-5 bg-[#a78bfa] ml-1.5 animate-pulse opacity-80" />
              </span>
            </Link>
            <p className="text-[#a1a1aa] text-sm leading-relaxed max-w-xs mb-6">
              System operacyjny dla software house&apos;ow i agencji developerskich. Zarzadzaj leadami, projektami i finansami w jednym miejscu.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-[#a1a1aa] hover:text-[#a78bfa] hover:bg-[#a78bfa]/10 rounded-lg transition-all duration-200"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-4 tracking-wide uppercase">
              Produkt
            </h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[#a1a1aa] text-sm hover:text-[#a78bfa] transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-4 tracking-wide uppercase">
              Firma
            </h3>
            <ul className="space-y-3">
              {footerLinks.firma.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[#a1a1aa] text-sm hover:text-[#a78bfa] transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-4 tracking-wide uppercase">
              Prawne
            </h3>
            <ul className="space-y-3">
              {footerLinks.prawne.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[#a1a1aa] text-sm hover:text-[#a78bfa] transition-colors duration-200 flex items-center gap-2"
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-[#27272a] flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
          <p className="text-[#a1a1aa]">
            &copy; {new Date().getFullYear()} DevCRM. Wszelkie prawa zastrzezone.
          </p>
          <div className="flex items-center gap-2 text-[#a1a1aa]">
            <span className="w-2 h-2 rounded-full bg-[#34d399]"></span>
            <span>System operacyjny dla tech teamów. All systems operational.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
