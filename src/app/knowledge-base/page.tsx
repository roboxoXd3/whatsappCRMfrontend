"use client"

import React from 'react'
// Removed unused Card components
import KnowledgeBaseManager from '@/components/knowledge/knowledge-base-manager'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { BookOpen } from 'lucide-react'

export default function KnowledgeBasePage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <BookOpen className="h-8 w-8" />
              Knowledge Base
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your AI assistant's knowledge and make it an expert in your business
            </p>
          </div>
        </div>

        {/* Knowledge Base Manager */}
        <KnowledgeBaseManager />
      </div>
    </ProtectedRoute>
  )
}
