'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Key, User, Bell, Shield, Palette, Database } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const settingsCategories = [
    {
      title: 'API Keys',
      description: 'Manage your OpenAI and WhatsApp API keys',
      icon: Key,
      href: '/settings/api-keys',
      status: 'Available',
    },
    {
      title: 'Profile',
      description: 'Update your personal information and preferences',
      icon: User,
      href: '/settings/profile',
      status: 'Coming Soon',
    },
    {
      title: 'Notifications',
      description: 'Configure email and system notifications',
      icon: Bell,
      href: '/settings/notifications',
      status: 'Coming Soon',
    },
    {
      title: 'Security',
      description: 'Password, two-factor authentication, and security logs',
      icon: Shield,
      href: '/settings/security',
      status: 'Coming Soon',
    },
    {
      title: 'Appearance',
      description: 'Customize the look and feel of your workspace',
      icon: Palette,
      href: '/settings/appearance',
      status: 'Coming Soon',
    },
    {
      title: 'Data & Privacy',
      description: 'Export data, delete account, and privacy settings',
      icon: Database,
      href: '/settings/data-privacy',
      status: 'Coming Soon',
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {settingsCategories.map((category) => {
          const IconComponent = category.icon;
          const isAvailable = category.status === 'Available';
          
          return (
            <Card key={category.href} className={`transition-all hover:shadow-md ${!isAvailable ? 'opacity-60' : ''}`}>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${isAvailable ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isAvailable 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {category.status}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  {category.description}
                </CardDescription>
                {isAvailable ? (
                  <Link href={category.href}>
                    <Button className="w-full">
                      Configure
                    </Button>
                  </Link>
                ) : (
                  <Button disabled className="w-full">
                    Coming Soon
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-12 p-6 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">🚀 SaaS Features Available</h3>
        <p className="text-blue-700 mb-4">
          You can now manage your own API keys! This makes your WhatsApp AI chatbot completely independent.
        </p>
        <div className="space-y-2 text-sm text-blue-600">
          <div className="flex items-center space-x-2">
            <Key className="h-4 w-4" />
            <span>✅ Add your own OpenAI API keys</span>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>✅ Secure encrypted storage</span>
          </div>
          <div className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span>✅ Multi-tenant workspace isolation</span>
          </div>
        </div>
        <Link href="/settings/api-keys">
          <Button className="mt-4">
            <Key className="h-4 w-4 mr-2" />
            Manage API Keys
          </Button>
        </Link>
      </div>
    </div>
  );
} 