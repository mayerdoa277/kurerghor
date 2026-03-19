import { useState } from 'react'
import { Eye, EyeOff, Settings } from 'lucide-react'
import { isDemoMode, setDemoMode } from '../utils/index.js'

const DemoModeToggle = () => {
  const [isOpen, setIsOpen] = useState(false)
  const demoMode = isDemoMode()

  const handleToggle = () => {
    const newState = !demoMode
    setDemoMode(newState)
    window.location.reload()
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
        title="Demo Mode Settings"
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* Settings Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-64">
          <h3 className="font-semibold text-gray-900 mb-3">Demo Mode</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Use Demo Data</span>
              <button
                onClick={handleToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  demoMode ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    demoMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <p>• Demo mode uses mock data</p>
              <p>• No backend connection needed</p>
              <p>• Perfect for testing UI</p>
            </div>

            <div className={`text-xs px-2 py-1 rounded text-center ${
              demoMode ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}>
              {demoMode ? 'Demo Mode ON' : 'Live Mode'}
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            <EyeOff className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

export default DemoModeToggle
