import { useState } from 'react'
import { 
  ChevronDown, 
  ChevronUp, 
  HelpCircle, 
  MessageCircle,
  Search,
  Package,
  CreditCard,
  Truck,
  Shield,
  User
} from 'lucide-react'

const FAQPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedItems, setExpandedItems] = useState(new Set())

  const faqCategories = [
    {
      title: 'Getting Started',
      icon: HelpCircle,
      questions: [
        {
          id: 1,
          question: 'How do I create an account?',
          answer: 'Creating an account is easy! Click on the "Sign Up" button in the top right corner, fill in your details, and verify your email address. The whole process takes less than 2 minutes.'
        },
        {
          id: 2,
          question: 'Is registration free?',
          answer: 'Yes, registration is completely free for both customers and vendors. You can browse products and make purchases without any membership fees.'
        },
        {
          id: 3,
          question: 'What information do I need to provide?',
          answer: 'For customer registration, you\'ll need your name, email address, and a password. For vendor registration, additional business information may be required.'
        }
      ]
    },
    {
      title: 'Orders & Shipping',
      icon: Package,
      questions: [
        {
          id: 4,
          question: 'How can I track my order?',
          answer: 'Once your order is shipped, you\'ll receive a tracking number via email. You can also track your order by logging into your account and viewing your order history.'
        },
        {
          id: 5,
          question: 'What are the shipping options?',
          answer: 'We offer standard shipping (3-5 business days) and express shipping (1-2 business days). Free shipping is available on orders over $50.'
        },
        {
          id: 6,
          question: 'Do you ship internationally?',
          answer: 'Currently, we ship within the United States. We\'re working on expanding our international shipping options soon.'
        },
        {
          id: 7,
          question: 'Can I change my shipping address?',
          answer: 'You can change your shipping address before your order is processed. Once shipped, address changes are not possible. Please contact customer service for assistance.'
        }
      ]
    },
    {
      title: 'Payments & Returns',
      icon: CreditCard,
      questions: [
        {
          id: 8,
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit cards, debit cards, Aamarpay, and cash on delivery for eligible orders. All transactions are secure and encrypted.'
        },
        {
          id: 9,
          question: 'Is my payment information secure?',
          answer: 'Absolutely! We use industry-standard SSL encryption to protect your payment information. We never store your credit card details on our servers.'
        },
        {
          id: 10,
          question: 'What is your return policy?',
          answer: 'We offer a 30-day return policy for unused items in original packaging. Simply contact our customer service team to initiate a return.'
        },
        {
          id: 11,
          question: 'How do refunds work?',
          answer: 'Refunds are processed within 5-7 business days after we receive your returned item. The refund will be credited to your original payment method.'
        }
      ]
    },
    {
      title: 'Account Management',
      icon: User,
      questions: [
        {
          id: 12,
          question: 'How do I reset my password?',
          answer: 'Click on "Forgot Password" on the login page, enter your email address, and follow the instructions sent to your email to reset your password.'
        },
        {
          id: 13,
          question: 'Can I change my email address?',
          answer: 'Yes, you can update your email address in your account settings. You\'ll need to verify the new email address before it becomes active.'
        },
        {
          id: 14,
          question: 'How do I delete my account?',
          answer: 'You can delete your account from your account settings. Please note that this action is permanent and cannot be undone.'
        }
      ]
    }
  ]

  const toggleExpanded = (id) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const filteredQuestions = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Find answers to common questions about our platform
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-12">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for answers..."
            className="search-input w-full"
          />
        </div>
      </div>

      {/* FAQ Categories */}
      <div className="space-y-8">
        {filteredQuestions.map((category, categoryIndex) => {
          const Icon = category.icon
          return (
            <div key={categoryIndex} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Category Header */}
              <div className="p-6 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {category.title}
                  </h2>
                </div>
              </div>

              {/* Questions */}
              <div className="divide-y divide-gray-200">
                {category.questions.map((item) => (
                  <div key={item.id} className="p-6">
                    <button
                      onClick={() => toggleExpanded(item.id)}
                      className="w-full text-left group"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors pr-8">
                          {item.question}
                        </h3>
                        <div className="flex-shrink-0">
                          {expandedItems.has(item.id) ? (
                            <ChevronUp className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                          )}
                        </div>
                      </div>
                    </button>
                    
                    {/* Answer */}
                    {expandedItems.has(item.id) && (
                      <div className="mt-4 pl-4 text-gray-600 leading-relaxed animate-fade-in">
                        {item.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* No Results */}
      {filteredQuestions.every(category => category.questions.length === 0) && (
        <div className="text-center py-16">
          <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No results found
          </h3>
          <p className="text-gray-600 mb-8">
            Try searching with different keywords or browse our FAQ categories.
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="btn-primary"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Contact Support */}
      <div className="mt-16 bg-primary-50 rounded-lg p-8 border border-primary-200">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Still have questions?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Can't find what you're looking for? Our customer support team is here to help!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@ecommerce.com"
              className="btn-primary flex items-center justify-center space-x-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Email Support</span>
            </a>
            
            <a
              href="tel:+1234567890"
              className="btn-outline flex items-center justify-center space-x-2"
            >
              <Shield className="w-4 h-4" />
              <span>Call Support</span>
            </a>
          </div>
          
          <div className="mt-6 text-sm text-gray-600">
            <p>Response time: Usually within 24 hours</p>
            <p>Available: Monday - Friday, 9 AM - 6 PM EST</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FAQPage
