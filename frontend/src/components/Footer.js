  import Link from 'next/link';
  import Image from 'next/image';
import { BookOpen, Mail, Phone, MapPin, Twitter, Linkedin, Youtube, Facebook } from 'lucide-react';

const TikTokIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    {...props}
  >
    <path d="M15 2a5.5 5.5 0 0 0 .03 1.08 3.97 3.97 0 0 0 3.42 3.38c.18.02.36.03.55.03V8.5a7.06 7.06 0 0 1-4-.96v6.14a5.64 5.64 0 1 1-5-5.6v3.12a2.62 2.62 0 1 0 2 2.52V2h3Z" />
  </svg>
);

  export default function Footer({ translations }) {
    return (
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and description */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 relative">
                  <Image
                    src="/logo/Logo Designe.png"
                    alt="Saqib Education Hub Logo"
                    fill
                    sizes="32px"
                    className="object-contain"
                  />
                </div>
                <span className="text-xl font-bold">Saqib Education Hub</span>
              </div>
              <p className="text-gray-300 mb-4 max-w-md">
                Your gateway to knowledge, opportunities, and growth. Discover books, find jobs, explore scholarships, 
                read articles, and watch educational videos all in one place.
              </p>
              <div className="flex space-x-4">
                <a
                  href="https://www.facebook.com/share/1AGW9SFvyp/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="https://www.tiktok.com/@saqibeducationhub?is_from_webapp=1&sender_device=pc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="TikTok"
                >
                  <TikTokIcon className="w-5 h-5" />
                </a>
                <a
                  href="https://www.instagram.com/seh81532?igsh=MWZkd2kwc3Y1ZjliMA=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Instagram"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5"
                    aria-hidden="true"
                  >
                    <path d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7Zm0 2h10c1.66 0 3 1.34 3 3v10c0 1.66-1.34 3-3 3H7c-1.66 0-3-1.34-3-3V7c0-1.66 1.34-3 3-3Zm10 1a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm-5 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z" />
                  </svg>
                </a>
                <a
                  href="https://www.youtube.com/@SaqibeducationHub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube className="w-5 h-5" />
                </a>
                <a
                  href="https://twitter.com/Saqibeduca40712"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href="https://www.linkedin.com/in/saqibeducation-hub-41a2b0386"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Access */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Access</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/jobs" className="text-gray-300 hover:text-white transition-colors">
                    {translations['navigation.jobs'] || 'Jobs'}
                  </Link>
                </li>
                <li>
                  <Link href="/scholarships" className="text-gray-300 hover:text-white transition-colors">
                    {translations['navigation.scholarships'] || 'Scholarships'}
                  </Link>
                </li>
                <li>
                  <Link href="/books" className="text-gray-300 hover:text-white transition-colors">
                    {translations['navigation.books'] || 'Books'}
                  </Link>
                </li>
                <li>
                  <Link href="/articles" className="text-gray-300 hover:text-white transition-colors">
                    {translations['navigation.articles'] || 'Articles'}
                  </Link>
                </li>
                <li>
                  <Link href="/videos" className="text-gray-300 hover:text-white transition-colors">
                    {translations['navigation.videos'] || 'Videos'}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact info */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">info@saqibeduhub.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">education@saqibeduhub.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">+93 765638741</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">Kabul, Afghanistan</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm text-center md:text-left">
              <p>© 2025 All Right Reserved</p>
              <p className="mt-1">
                Made with ❤️ by <a href="https://urooj-tech.com" className="text-white hover:text-gray-300 transition-colors">Urooj Technology</a>
              </p>
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                Terms of Service
              </Link>
              <Link href="/contact" className="text-gray-400 hover:text-white text-sm transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    );
  } 