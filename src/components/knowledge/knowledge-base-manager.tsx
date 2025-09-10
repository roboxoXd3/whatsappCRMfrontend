"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Upload, 
  FileText, 
  Globe, 
  Type, 
  Trash2, 
  Search, 
  BookOpen,
  CheckCircle,
  Loader2,
  Eye
} from 'lucide-react'
import { toast } from 'sonner'
import { KnowledgeAPI, KnowledgeDocument, KnowledgeStats } from '@/lib/api/knowledge'

// Use the interfaces from the API module
type Document = KnowledgeDocument;

export default function KnowledgeBaseManager() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [stats, setStats] = useState<KnowledgeStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [activeTab, setActiveTab] = useState('documents')
  
  // Upload form states
  const [uploadType, setUploadType] = useState<'file' | 'url' | 'text'>('file')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadUrl, setUploadUrl] = useState('')
  const [uploadText, setUploadText] = useState('')
  const [uploadCategory, setUploadCategory] = useState('general')
  const [uploadTitle, setUploadTitle] = useState('')
  
  // Test results state
  const [testResults, setTestResults] = useState<any>(null)
  const [showTestResults, setShowTestResults] = useState(false)
  const [expandedResults, setExpandedResults] = useState<Set<number>>(new Set())
  
  // Document viewing state
  const [viewingDocument, setViewingDocument] = useState<KnowledgeDocument | null>(null)
  const [documentContent, setDocumentContent] = useState<string>('')
  const [loadingContent, setLoadingContent] = useState(false)
  
  // Using sonner toast system

  useEffect(() => {
    loadKnowledgeData()
  }, [])

  const loadKnowledgeData = async () => {
    try {
      setLoading(true)
      
      // Load documents and stats in parallel using the API client
      const [documentsData, statsData] = await Promise.all([
        KnowledgeAPI.listDocuments(),
        KnowledgeAPI.getStats()
      ])

      setDocuments(documentsData.documents || [])
      setStats(statsData || null)
    } catch (error) {
      console.error('Error loading knowledge data:', error)
      toast.error("Failed to load knowledge base data")
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async () => {
    if (!uploadFile && !uploadUrl && !uploadText) {
      toast.error("Please provide content to upload")
      return
    }

    try {
      setUploading(true)
      
      const formData = new FormData()
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001'
      const endpoint = `${apiUrl}/api/knowledge/upload`
      const requestOptions: RequestInit = {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      }

      if (uploadType === 'file' && uploadFile) {
        formData.append('file', uploadFile)
        formData.append('category', uploadCategory)
        if (uploadTitle) formData.append('title', uploadTitle)
        requestOptions.method = 'POST'
        requestOptions.body = formData
      } else {
        const payload: any = {
          category: uploadCategory
        }
        
        if (uploadTitle) payload.title = uploadTitle
        
        if (uploadType === 'url') {
          payload.url = uploadUrl
        } else if (uploadType === 'text') {
          payload.text = uploadText
        }
        
        requestOptions.method = 'POST'
        requestOptions.headers = {
          ...requestOptions.headers,
          'Content-Type': 'application/json'
        }
        requestOptions.body = JSON.stringify(payload)
      }

      const response = await fetch(endpoint, requestOptions)
      const result = await response.json()

      if (response.ok) {
        toast.success("Document uploaded successfully")
        
        // Reset form
        setUploadFile(null)
        setUploadUrl('')
        setUploadText('')
        setUploadTitle('')
        setUploadCategory('general')
        
        // Reload data
        loadKnowledgeData()
      } else {
        throw new Error(result.message || 'Upload failed')
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || "Failed to upload document")
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001'
      const response = await fetch(`${apiUrl}/api/knowledge/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (response.ok) {
        toast.success("Document deleted successfully")
        loadKnowledgeData()
      } else {
        const result = await response.json()
        throw new Error(result.message || 'Delete failed')
      }
    } catch (error: any) {
      console.error('Delete error:', error)
      toast.error(error.message || "Failed to delete document")
    }
  }

  const testKnowledge = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a test query")
      return
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001'
      const response = await fetch(`${apiUrl}/api/knowledge/test`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: searchQuery })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(`Found ${result.data.total_found} relevant documents`)
        setTestResults(result.data)
        setShowTestResults(true)
      } else {
        throw new Error(result.message || 'Test failed')
      }
    } catch (error: any) {
      console.error('Test error:', error)
      toast.error(error.message || "Failed to test knowledge base")
    }
  }

  const toggleExpandResult = (index: number) => {
    const newExpanded = new Set(expandedResults)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedResults(newExpanded)
  }

  const viewDocument = async (document: KnowledgeDocument) => {
    try {
      setLoadingContent(true)
      setViewingDocument(document)
      
      // Fetch full document content
      const fullDocument = await KnowledgeAPI.getDocument(document.id)
      setDocumentContent(fullDocument.content || 'No content available')
    } catch (error) {
      console.error('Error loading document content:', error)
      toast.error("Failed to load document content")
      setDocumentContent('Failed to load content')
    } finally {
      setLoadingContent(false)
    }
  }

  const closeDocumentView = () => {
    setViewingDocument(null)
    setDocumentContent('')
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = !searchQuery || 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.content_preview && doc.content_preview.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const categories = stats?.categories ? Object.keys(stats.categories) : []

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading knowledge base...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Documents</p>
                <p className="text-2xl font-bold">{stats?.total_documents || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Categories</p>
                <p className="text-2xl font-bold">{stats?.total_categories || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Type className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Avg Length</p>
                <p className="text-2xl font-bold">{stats?.avg_content_length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Status</p>
                <Badge variant={stats?.status === 'healthy' ? 'default' : 'secondary'}>
                  {stats?.status || 'Unknown'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Limits */}
      {stats?.subscription_limits && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Document Usage</span>
              <span className="text-sm text-muted-foreground">
                {stats.total_documents} / {stats.subscription_limits.max_documents}
              </span>
            </div>
            <Progress 
              value={(stats.total_documents / stats.subscription_limits.max_documents) * 100} 
              className="h-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {stats.subscription_limits.current_plan} plan
            </p>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="test">Test Knowledge</TabsTrigger>
        </TabsList>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category} ({stats?.categories[category]})
                </option>
              ))}
            </select>
          </div>

          {/* Documents List */}
          <div className="grid gap-4">
            {filteredDocuments.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No documents found</h3>
                  <p className="text-muted-foreground mb-4">
                    {documents.length === 0 
                      ? "Start by uploading your first document to build your knowledge base."
                      : "Try adjusting your search or filter criteria."
                    }
                  </p>
                  {documents.length === 0 && (
                    <Button onClick={() => setActiveTab('upload')}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Document
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredDocuments.map(doc => (
                <Card key={doc.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{doc.title}</h3>
                          <Badge variant="outline">{doc.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {doc.content_preview}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{doc.content_length} characters</span>
                          <span>Updated {new Date(doc.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => viewDocument(doc)}
                          disabled={loadingContent}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(doc.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Knowledge</CardTitle>
              <CardDescription>
                Add documents, websites, or text content to your knowledge base
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload Type Selection */}
              <div className="flex gap-2">
                <Button
                  variant={uploadType === 'file' ? 'default' : 'outline'}
                  onClick={() => setUploadType('file')}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  File
                </Button>
                <Button
                  variant={uploadType === 'url' ? 'default' : 'outline'}
                  onClick={() => setUploadType('url')}
                  className="flex-1"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Website
                </Button>
                <Button
                  variant={uploadType === 'text' ? 'default' : 'outline'}
                  onClick={() => setUploadType('text')}
                  className="flex-1"
                >
                  <Type className="h-4 w-4 mr-2" />
                  Text
                </Button>
              </div>

              {/* Upload Content */}
              {uploadType === 'file' && (
                <div>
                  <Label htmlFor="file">Select File</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".txt,.md,.pdf,.docx,.html"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Supported: TXT, MD, PDF, DOCX, HTML (max 10MB)
                  </p>
                </div>
              )}

              {uploadType === 'url' && (
                <div>
                  <Label htmlFor="url">Website URL</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com/page"
                    value={uploadUrl}
                    onChange={(e) => setUploadUrl(e.target.value)}
                  />
                </div>
              )}

              {uploadType === 'text' && (
                <div>
                  <Label htmlFor="text">Text Content</Label>
                  <textarea
                    id="text"
                    className="w-full h-32 p-3 border rounded-md"
                    placeholder="Enter your text content here..."
                    value={uploadText}
                    onChange={(e) => setUploadText(e.target.value)}
                  />
                </div>
              )}

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title (optional)</Label>
                  <Input
                    id="title"
                    placeholder="Document title"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="general">General</option>
                    <option value="products">Products</option>
                    <option value="services">Services</option>
                    <option value="policies">Policies</option>
                    <option value="faq">FAQ</option>
                    <option value="support">Support</option>
                  </select>
                </div>
              </div>

              {/* Upload Button */}
              <Button 
                onClick={handleUpload} 
                disabled={uploading}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload to Knowledge Base
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test Tab */}
        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Knowledge Base</CardTitle>
              <CardDescription>
                Test how well your AI can find relevant information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="testQuery">Test Query</Label>
                <Input
                  id="testQuery"
                  placeholder="Ask a question about your business..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button onClick={testKnowledge} className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Test Knowledge Base
              </Button>
              
              {/* Test Results */}
              {showTestResults && testResults && (
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Test Results</h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowTestResults(false)}
                    >
                      Close
                    </Button>
                  </div>
                  
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">
                      Query: "{testResults.query}"
                    </p>
                    <p className="text-sm font-medium mb-4">
                      Found {testResults.total_found} relevant document(s)
                    </p>
                    
                    {testResults.results && testResults.results.length > 0 ? (
                      <div className="space-y-3">
                        {testResults.results.map((result: any, index: number) => (
                          <div key={index} className="bg-background p-3 rounded border">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{result.title}</h4>
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                {Math.round(result.similarity_score * 100)}% match
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              Source: {result.source}
                            </p>
                            <div className="text-sm">
                              <div className={`whitespace-pre-wrap ${expandedResults.has(index) ? '' : 'max-h-32 overflow-hidden'}`}>
                                {result.content_preview}
                              </div>
                              {result.content_preview && result.content_preview.length > 200 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleExpandResult(index)}
                                  className="mt-2 p-0 h-auto text-primary hover:text-primary/80"
                                >
                                  {expandedResults.has(index) ? 'Show Less' : 'Show More'}
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No relevant documents found. Try a different query or add more content to your knowledge base.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Document View Dialog */}
      <Dialog open={!!viewingDocument} onOpenChange={(open) => !open && closeDocumentView()}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>{viewingDocument?.title}</DialogTitle>
            <DialogDescription>
              {viewingDocument?.source} • {viewingDocument?.category} • 
              Updated {viewingDocument ? new Date(viewingDocument.updated_at).toLocaleDateString() : ''}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto min-h-0 py-4">
            {loadingContent ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading content...</span>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed font-mono bg-gray-50 p-4 rounded border">
                  {documentContent}
                </pre>
              </div>
            )}
          </div>
          
          <div className="flex justify-end pt-4 border-t flex-shrink-0">
            <Button onClick={closeDocumentView}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
