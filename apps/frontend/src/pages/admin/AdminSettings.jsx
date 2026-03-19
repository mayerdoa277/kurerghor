import { useState } from 'react'
import { 
  Settings, 
  Save, 
  Shield, 
  Mail, 
  DollarSign,
  Globe,
  Bell,
  Database
} from 'lucide-react'
import toast from 'react-hot-toast'

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general')
  const [isSaving, setIsSaving] = useState(false)
  
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Ecommerce Platform',
    siteUrl: 'https://ecommerce.com',
    adminEmail: 'admin@ecommerce.com',
    maintenanceMode: false,
    debugMode: false
  })
  
  const [paymentSettings, setPaymentSettings] = useState({
    aamarpayEnabled: true,
    aamarpayStoreId: '',
    aamarpaySignatureKey: '',
    cashOnDeliveryEnabled: true,
    minimumOrderAmount: 10,
    maximumOrderAmount: 10000
  })
  
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    emailFrom: 'noreply@ecommerce.com',
    emailFromName: 'Ecommerce Platform'
  })
  
  const [securitySettings, setSecuritySettings] = useState({
    enable2FA: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    enableCaptcha: true
  })

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'payment', label: 'Payment', icon: DollarSign },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'security', label: 'Security', icon: Shield }
  ]

  const handleSave = async (tab) => {
    setIsSaving(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('Settings saved successfully!')
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Site Name
          </label>
          <input
            type="text"
            value={generalSettings.siteName}
            onChange={(e) => setGeneralSettings(prev => ({ ...prev, siteName: e.target.value }))}
            className="input"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Site URL
          </label>
          <input
            type="url"
            value={generalSettings.siteUrl}
            onChange={(e) => setGeneralSettings(prev => ({ ...prev, siteUrl: e.target.value }))}
            className="input"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Admin Email
          </label>
          <input
            type="email"
            value={generalSettings.adminEmail}
            onChange={(e) => setGeneralSettings(prev => ({ ...prev, adminEmail: e.target.value }))}
            className="input"
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={generalSettings.maintenanceMode}
            onChange={(e) => setGeneralSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <span className="text-sm text-gray-700">Maintenance Mode</span>
        </label>
        
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={generalSettings.debugMode}
            onChange={(e) => setGeneralSettings(prev => ({ ...prev, debugMode: e.target.checked }))}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <span className="text-sm text-gray-700">Debug Mode</span>
        </label>
      </div>
    </div>
  )

  const renderPaymentSettings = () => (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Aamarpay Settings</h3>
        
        <div className="space-y-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={paymentSettings.aamarpayEnabled}
              onChange={(e) => setPaymentSettings(prev => ({ ...prev, aamarpayEnabled: e.target.checked }))}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Enable Aamarpay</span>
          </label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store ID
              </label>
              <input
                type="text"
                value={paymentSettings.aamarpayStoreId}
                onChange={(e) => setPaymentSettings(prev => ({ ...prev, aamarpayStoreId: e.target.value }))}
                className="input"
                placeholder="Enter Aamarpay Store ID"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Signature Key
              </label>
              <input
                type="password"
                value={paymentSettings.aamarpaySignatureKey}
                onChange={(e) => setPaymentSettings(prev => ({ ...prev, aamarpaySignatureKey: e.target.value }))}
                className="input"
                placeholder="Enter Signature Key"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-b border-gray-200 pb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Cash on Delivery</h3>
        
        <div className="space-y-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={paymentSettings.cashOnDeliveryEnabled}
              onChange={(e) => setPaymentSettings(prev => ({ ...prev, cashOnDeliveryEnabled: e.target.checked }))}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Enable Cash on Delivery</span>
          </label>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Order Limits</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Order Amount ($)
            </label>
            <input
              type="number"
              value={paymentSettings.minimumOrderAmount}
              onChange={(e) => setPaymentSettings(prev => ({ ...prev, minimumOrderAmount: parseFloat(e.target.value) }))}
              className="input"
              min="0"
              step="0.01"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Order Amount ($)
            </label>
            <input
              type="number"
              value={paymentSettings.maximumOrderAmount}
              onChange={(e) => setPaymentSettings(prev => ({ ...prev, maximumOrderAmount: parseFloat(e.target.value) }))}
              className="input"
              min="0"
              step="0.01"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">SMTP Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SMTP Host
            </label>
            <input
              type="text"
              value={emailSettings.smtpHost}
              onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
              className="input"
              placeholder="smtp.gmail.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SMTP Port
            </label>
            <input
              type="number"
              value={emailSettings.smtpPort}
              onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPort: parseInt(e.target.value) }))}
              className="input"
              placeholder="587"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SMTP Username
            </label>
            <input
              type="text"
              value={emailSettings.smtpUsername}
              onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpUsername: e.target.value }))}
              className="input"
              placeholder="your-email@gmail.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SMTP Password
            </label>
            <input
              type="password"
              value={emailSettings.smtpPassword}
              onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPassword: e.target.value }))}
              className="input"
              placeholder="Your app password"
            />
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Email Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Email
            </label>
            <input
              type="email"
              value={emailSettings.emailFrom}
              onChange={(e) => setEmailSettings(prev => ({ ...prev, emailFrom: e.target.value }))}
              className="input"
              placeholder="noreply@ecommerce.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Name
            </label>
            <input
              type="text"
              value={emailSettings.emailFromName}
              onChange={(e) => setEmailSettings(prev => ({ ...prev, emailFromName: e.target.value }))}
              className="input"
              placeholder="Ecommerce Platform"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Test Email Configuration</h4>
        <button className="btn-outline">
          Send Test Email
        </button>
      </div>
    </div>
  )

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Authentication</h3>
        
        <div className="space-y-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={securitySettings.enable2FA}
              onChange={(e) => setSecuritySettings(prev => ({ ...prev, enable2FA: e.target.checked }))}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Enable Two-Factor Authentication</span>
          </label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                value={securitySettings.sessionTimeout}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                className="input"
                min="5"
                max="1440"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Login Attempts
              </label>
              <input
                type="number"
                value={securitySettings.maxLoginAttempts}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) }))}
                className="input"
                min="1"
                max="10"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Password Policy</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Password Length
            </label>
            <input
              type="number"
              value={securitySettings.passwordMinLength}
              onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordMinLength: parseInt(e.target.value) }))}
              className="input"
              min="6"
              max="32"
            />
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Protection</h3>
        
        <div className="space-y-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={securitySettings.enableCaptcha}
              onChange={(e) => setSecuritySettings(prev => ({ ...prev, enableCaptcha: e.target.checked }))}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Enable CAPTCHA</span>
          </label>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'general': return renderGeneralSettings()
      case 'payment': return renderPaymentSettings()
      case 'email': return renderEmailSettings()
      case 'security': return renderSecuritySettings()
      default: return renderGeneralSettings()
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Settings</h1>
        <p className="text-gray-600">Configure platform settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 capitalize">
                {activeTab} Settings
              </h2>
              
              <button
                onClick={() => handleSave(activeTab)}
                disabled={isSaving}
                className="btn-primary flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>

            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminSettings
