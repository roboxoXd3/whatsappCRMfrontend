'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth';
import { Loader2, MessageSquare, Sparkles, Users, BarChart3, Zap } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    // Check authentication status and redirect accordingly
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/auth/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Show enhanced loading screen while checking auth
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 text-center max-w-md mx-auto px-6">
        {/* Logo and Brand */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur-lg opacity-30 animate-pulse"></div>
            <div className="relative bg-white rounded-2xl p-4 shadow-2xl border border-white/20 backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <MessageSquare className="h-10 w-10 text-blue-600" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <Sparkles className="h-2 w-2 text-white" />
                  </div>
                </div>
                <div className="text-left">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    WhatsApp CRM
                  </h1>
                  <p className="text-sm text-gray-500 font-medium">AI-Powered</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-white/20 shadow-lg">
            <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-xs font-medium text-gray-700">Smart CRM</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-white/20 shadow-lg">
            <BarChart3 className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-xs font-medium text-gray-700">Analytics</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-white/20 shadow-lg">
            <Zap className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <p className="text-xs font-medium text-gray-700">Automation</p>
          </div>
        </div>

        {/* Loading indicator */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="relative">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <div className="absolute inset-0 rounded-full border-2 border-blue-200 animate-ping"></div>
            </div>
            <div className="text-left">
              <p className="text-lg font-semibold text-gray-900">Initializing...</p>
              <p className="text-sm text-gray-600">Setting up your workspace</p>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full animate-pulse" style={{width: '75%'}}></div>
          </div>
          
          <p className="text-sm text-gray-500 leading-relaxed">
            Connecting to your AI-powered customer management system...
          </p>
        </div>

        {/* Status indicators */}
        <div className="mt-6 flex justify-center space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-gray-600">WhatsApp API</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-200"></div>
            <span className="text-gray-600">AI Engine</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-400"></div>
            <span className="text-gray-600">Database</span>
          </div>
        </div>
      </div>
    </div>
  );
}
