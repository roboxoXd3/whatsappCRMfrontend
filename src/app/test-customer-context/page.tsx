import { CustomerContextTest } from '@/components/conversations/customer-context-test';

export default function TestCustomerContextPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Customer Context API Integration Test
            </h1>
            <p className="mt-2 text-gray-600">
              Test the CRM-Chat integration that provides personalized AI responses using real-time customer data.
            </p>
          </div>
        </div>
      </div>
      
      <CustomerContextTest />
    </div>
  );
} 