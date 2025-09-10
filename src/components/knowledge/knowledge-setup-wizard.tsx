"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Upload, 
  FileText, 
  Globe, 
  Type, 
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  BookOpen,
  Lightbulb,
  Zap
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface KnowledgeSetupWizardProps {
  onComplete: () => void
  onSkip: () => void
}

interface UploadItem {
  id: string
  type: 'file' | 'url' | 'text'
  content: string
  title: string
  category: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

const BUSINESS_TEMPLATES = [
  {
    id: 'restaurant',
    name: 'Restaurant',
    description: 'Menu items, hours, policies, specials',
    categories: ['menu', 'hours', 'policies', 'specials'],
    examples: [
      'What are your hours?',
      'Do you have vegetarian options?',
      'Can I make a reservation?'
    ]
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    description: 'Products, shipping, returns, support',
    categories: ['products', 'shipping', 'returns', 'support'],
    examples: [
      'What is your return policy?',
      'How long does shipping take?',
      'Do you have this product in stock?'
    ]
  },
  {
    id: 'services',
    name: 'Service Business',
    description: 'Services, pricing, booking, FAQ',
    categories: ['services', 'pricing', 'booking', 'faq'],
    examples: [
      'What services do you offer?',
      'How much does it cost?',
      'How do I book an appointment?'
    ]
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    description: 'Services, appointments, insurance, policies',
    categories: ['services', 'appointments', 'insurance', 'policies'],
    examples: [
      'Do you accept my insurance?',
      'How do I schedule an appointment?',
      'What services do you provide?'
    ]
  },
  {
    id: 'custom',
    name: 'Custom',
    description: 'Build your own knowledge base',
    categories: ['general'],
    examples: []
  }
]

export default function KnowledgeSetupWizard({ onComplete, onSkip }: KnowledgeSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([])
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  const totalSteps = 3

  const addUploadItem = (type: 'file' | 'url' | 'text', content: string, title: string, category: string) => {
    const newItem: UploadItem = {
      id: Date.now().toString(),
      type,
      content,
      title,
      category,
      status: 'pending'
    }
    setUploadItems(prev => [...prev, newItem])
  }

  const removeUploadItem = (id: string) => {
    setUploadItems(prev => prev.filter(item => item.id !== id))
  }

  const uploadAllItems = async () => {
    if (uploadItems.length === 0) {
      toast({
        title: "No Content",
        description: "Please add some content to upload",
        variant: "destructive"
      })
      return
    }

    setUploading(true)
    
    for (const item of uploadItems) {
      try {
        // Update status to uploading
        setUploadItems(prev => 
          prev.map(i => i.id === item.id ? { ...i, status: 'uploading' } : i)
        )

        const requestOptions: RequestInit = {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }

        if (item.type === 'file') {
          // For files, we'd need to handle file upload differently
          // This is a simplified version
          const payload = {
            text: item.content,
            title: item.title,
            category: item.category
          }
          requestOptions.headers = {
            ...requestOptions.headers,
            'Content-Type': 'application/json'
          }
          requestOptions.body = JSON.stringify(payload)
        } else if (item.type === 'url') {
          const payload = {
            url: item.content,
            title: item.title,
            category: item.category
          }
          requestOptions.headers = {
            ...requestOptions.headers,
            'Content-Type': 'application/json'
          }
          requestOptions.body = JSON.stringify(payload)
        } else {
          const payload = {
            text: item.content,
            title: item.title,
            category: item.category
          }
          requestOptions.headers = {
            ...requestOptions.headers,
            'Content-Type': 'application/json'
          }
          requestOptions.body = JSON.stringify(payload)
        }

        const response = await fetch('/api/knowledge/upload', requestOptions)
        
        if (response.ok) {
          setUploadItems(prev => 
            prev.map(i => i.id === item.id ? { ...i, status: 'success' } : i)
          )
        } else {
          const result = await response.json()
          throw new Error(result.message || 'Upload failed')
        }
      } catch (error: any) {
        setUploadItems(prev => 
          prev.map(i => i.id === item.id ? { 
            ...i, 
            status: 'error', 
            error: error.message 
          } : i)
        )
      }
    }

    setUploading(false)
    
    // Check if all uploads were successful
    const successCount = uploadItems.filter(item => item.status === 'success').length
    if (successCount === uploadItems.length) {
      toast({
        title: "Success!",
        description: `All ${successCount} documents uploaded successfully`,
      })
      onComplete()
    } else {
      toast({
        title: "Partial Success",
        description: `${successCount} of ${uploadItems.length} documents uploaded`,
        variant: "destructive"
      })
    }
  }

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Choose Your Business Type
        </CardTitle>
        <CardDescription>
          Select a template to get started quickly, or build a custom knowledge base
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BUSINESS_TEMPLATES.map(template => (
            <div
              key={template.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedTemplate === template.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <h3 className="font-medium mb-2">{template.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {template.categories.map(category => (
                  <Badge key={category} variant="outline" className="text-xs">
                    {category}
                  </Badge>
                ))}
              </div>
              
              {template.examples.length > 0 && (
                <div>
                  <p className="text-xs font-medium mb-1">Example questions:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {template.examples.slice(0, 2).map((example, idx) => (
                      <li key={idx}>• {example}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {selectedTemplate && (
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              Great choice! In the next step, you'll add your specific business information 
              to make your AI assistant an expert in your {BUSINESS_TEMPLATES.find(t => t.id === selectedTemplate)?.name.toLowerCase()} business.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )

  const renderStep2 = () => {
    const template = BUSINESS_TEMPLATES.find(t => t.id === selectedTemplate)
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Add Your Business Knowledge
          </CardTitle>
          <CardDescription>
            Upload documents, add website content, or paste text about your {template?.name.toLowerCase()} business
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Add Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <QuickAddCard
              icon={<FileText className="h-6 w-6" />}
              title="Upload Files"
              description="PDFs, Word docs, text files"
              onClick={() => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = '.txt,.md,.pdf,.docx,.html'
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0]
                  if (file) {
                    // For demo purposes, we'll add it as text
                    addUploadItem('file', file.name, file.name, template?.categories[0] || 'general')
                  }
                }
                input.click()
              }}
            />
            
            <QuickAddCard
              icon={<Globe className="h-6 w-6" />}
              title="Add Website"
              description="Scrape content from your website"
              onClick={() => {
                const url = prompt('Enter website URL:')
                if (url) {
                  addUploadItem('url', url, `Content from ${url}`, 'website')
                }
              }}
            />
            
            <QuickAddCard
              icon={<Type className="h-6 w-6" />}
              title="Add Text"
              description="Paste or type content directly"
              onClick={() => {
                const text = prompt('Enter your content:')
                if (text && text.length > 50) {
                  const title = prompt('Enter a title for this content:') || 'Manual Content'
                  addUploadItem('text', text, title, template?.categories[0] || 'general')
                }
              }}
            />
          </div>

          {/* Upload Queue */}
          {uploadItems.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium">Content to Upload ({uploadItems.length})</h3>
              {uploadItems.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.title}</span>
                      <Badge variant="outline">{item.category}</Badge>
                      {item.status === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {item.status === 'uploading' && <Loader2 className="h-4 w-4 animate-spin" />}
                      {item.status === 'error' && <span className="text-red-500 text-sm">Error</span>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {item.type === 'url' ? item.content : `${item.content.substring(0, 100)}...`}
                    </p>
                    {item.error && (
                      <p className="text-sm text-red-500">{item.error}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeUploadItem(item.id)}
                    disabled={item.status === 'uploading'}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Business-Specific Suggestions */}
          {template && template.id !== 'custom' && (
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertDescription>
                <strong>Suggestions for {template.name} businesses:</strong>
                <ul className="mt-2 space-y-1">
                  {template.id === 'restaurant' && (
                    <>
                      <li>• Upload your menu with prices and descriptions</li>
                      <li>• Add your hours, location, and contact info</li>
                      <li>• Include policies (reservations, dietary restrictions)</li>
                    </>
                  )}
                  {template.id === 'ecommerce' && (
                    <>
                      <li>• Upload product catalogs and descriptions</li>
                      <li>• Add shipping and return policies</li>
                      <li>• Include FAQ and customer support info</li>
                    </>
                  )}
                  {template.id === 'services' && (
                    <>
                      <li>• List all services with detailed descriptions</li>
                      <li>• Add pricing information and packages</li>
                      <li>• Include booking process and availability</li>
                    </>
                  )}
                  {template.id === 'healthcare' && (
                    <>
                      <li>• List medical services and specialties</li>
                      <li>• Add insurance and payment information</li>
                      <li>• Include appointment scheduling process</li>
                    </>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    )
  }

  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Ready to Launch!
        </CardTitle>
        <CardDescription>
          Review your knowledge base and start your AI assistant
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          
          <div>
            <h3 className="text-lg font-medium">Knowledge Base Ready!</h3>
            <p className="text-muted-foreground">
              You've added {uploadItems.length} pieces of content to your knowledge base.
              Your AI assistant is now ready to help your customers with intelligent, 
              personalized responses based on your business information.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-4 border rounded-lg">
            <BookOpen className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <h4 className="font-medium">Smart Responses</h4>
            <p className="text-sm text-muted-foreground">
              AI answers based on your content
            </p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
            <h4 className="font-medium">Instant Updates</h4>
            <p className="text-sm text-muted-foreground">
              Add more content anytime
            </p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <h4 className="font-medium">Always Learning</h4>
            <p className="text-sm text-muted-foreground">
              Improves with every interaction
            </p>
          </div>
        </div>

        <Alert>
          <Lightbulb className="h-4 w-4" />
          <AlertDescription>
            <strong>Next Steps:</strong> You can always add more content, test your knowledge base, 
            and fine-tune your AI assistant's responses from the Knowledge Base section in your dashboard.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Header */}
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Set Up Your AI Knowledge Base</h1>
        <div className="space-y-2">
          <Progress value={(currentStep / totalSteps) * 100} className="w-full max-w-md mx-auto" />
          <p className="text-sm text-muted-foreground">
            Step {currentStep} of {totalSteps}
          </p>
        </div>
      </div>

      {/* Step Content */}
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}

      {/* Navigation */}
      <div className="flex justify-between">
        <div>
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" onClick={onSkip}>
            Skip for now
          </Button>
          
          {currentStep < totalSteps ? (
            <Button
              onClick={() => {
                if (currentStep === 1 && !selectedTemplate) {
                  toast({
                    title: "Please select a template",
                    description: "Choose a business type to continue",
                    variant: "destructive"
                  })
                  return
                }
                setCurrentStep(currentStep + 1)
              }}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={uploadItems.length > 0 ? uploadAllItems : onComplete}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : uploadItems.length > 0 ? (
                'Upload & Complete Setup'
              ) : (
                'Complete Setup'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

interface QuickAddCardProps {
  icon: React.ReactNode
  title: string
  description: string
  onClick: () => void
}

function QuickAddCard({ icon, title, description, onClick }: QuickAddCardProps) {
  return (
    <div
      className="p-4 border rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors text-center"
      onClick={onClick}
    >
      <div className="mb-3 text-blue-500">
        {icon}
      </div>
      <h3 className="font-medium mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
