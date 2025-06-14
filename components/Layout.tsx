'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ReactNode, useState, useEffect } from 'react';
import { auth, signOut } from '@/app/auth';
import { Role } from '@/prisma/enums';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const session = await auth();
      setUser(session?.user || null);
      setLoading(false);
    };
    
    getSession();
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isUserMenuOpen) setIsUserMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleSignOut = async () => {
    await signOut({ redirectTo: '/' });
  };

  const isAdmin = user?.role === Role.ADMIN;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header/Navigation */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative w-10 h-10">
                <Image
                  src="/window.svg"
                  alt="谁是人机 Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-xl font-bold text-gray-800">谁是人机</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-gray-600 hover:text-blue-500 transition-colors">
                首页
              </Link>
              <Link href="/content/create" className="text-gray-600 hover:text-blue-500 transition-colors">
                创建内容
              </Link>
              <Link 
                href="/content/create" 
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
              >
                开始挑战
              </Link>

              {!loading && (
                <>
                  {user ? (
                    <div className="relative">
                      <button 
                        onClick={toggleUserMenu}
                        className="flex items-center space-x-1 text-gray-600 hover:text-blue-500 focus:outline-none"
                      >
                        <span>{user.name || user.email}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {isUserMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                          <div className="px-4 py-2 border-b border-gray-100">
                            <p className="font-medium text-gray-800">{user.name}</p>
                            <p className="text-sm text-gray-500 truncate">{user.email}</p>
                          </div>
                          
                          {isAdmin && (
                            <Link 
                              href="/admin" 
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              管理面板
                            </Link>
                          )}
                          
                          <button
                            onClick={handleSignOut}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                          >
                            退出登录
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <Link href="/login" className="text-gray-600 hover:text-blue-500 transition-colors">
                        登录
                      </Link>
                      <Link href="/register" className="text-gray-600 hover:text-blue-500 transition-colors">
                        注册
                      </Link>
                    </div>
                  )}
                </>
              )}
            </nav>

            {/* Mobile menu button */}
            <button 
              className="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none"
              onClick={toggleMenu}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <nav className="md:hidden mt-4 pb-2">
              <ul className="flex flex-col space-y-3">
                <li>
                  <Link 
                    href="/" 
                    className="block text-gray-600 hover:text-blue-500 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    首页
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/content/create" 
                    className="block text-gray-600 hover:text-blue-500 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    创建内容
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/content/create" 
                    className="block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    开始挑战
                  </Link>
                </li>
                
                {!loading && (
                  <>
                    {user ? (
                      <>
                        <li className="pt-2 border-t border-gray-200">
                          <div className="px-1 py-2">
                            <p className="font-medium text-gray-800">{user.name}</p>
                            <p className="text-sm text-gray-500 truncate">{user.email}</p>
                          </div>
                        </li>
                        
                        {isAdmin && (
                          <li>
                            <Link 
                              href="/admin" 
                              className="block text-gray-600 hover:text-blue-500 transition-colors"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              管理面板
                            </Link>
                          </li>
                        )}
                        
                        <li>
                          <button
                            onClick={handleSignOut}
                            className="block w-full text-left text-red-600 hover:text-red-700 transition-colors"
                          >
                            退出登录
                          </button>
                        </li>
                      </>
                    ) : (
                      <>
                        <li className="pt-2 border-t border-gray-200">
                          <Link 
                            href="/login" 
                            className="block text-gray-600 hover:text-blue-500 transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            登录
                          </Link>
                        </li>
                        <li>
                          <Link 
                            href="/register" 
                            className="block text-gray-600 hover:text-blue-500 transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            注册
                          </Link>
                        </li>
                      </>
                    )}
                  </>
                )}
              </ul>
            </nav>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center justify-center md:justify-start space-x-2">
                <div className="relative w-6 h-6">
                  <Image
                    src="/window.svg"
                    alt="谁是人机 Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-sm font-semibold text-gray-700">谁是人机</span>
              </div>
              <p className="text-sm text-gray-500 mt-1 text-center md:text-left">
                测试你的AI检测能力
              </p>
            </div>
            
            <div className="flex space-x-6">
              <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
                首页
              </Link>
              <Link href="/about" className="text-sm text-gray-500 hover:text-gray-700">
                关于我们
              </Link>
              <Link href="/terms" className="text-sm text-gray-500 hover:text-gray-700">
                使用条款
              </Link>
            </div>
          </div>
          
          <div className="mt-6 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} 谁是人机. 保留所有权利.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;