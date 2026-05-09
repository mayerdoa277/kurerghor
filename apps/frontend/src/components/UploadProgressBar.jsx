import React from 'react'

const UploadProgressBar = ({ isUploading, uploadProgress, uploadData, onDismiss, currentImage = 0, totalImages = 0 }) => {
  if (!isUploading || !uploadData) return null

  const productName = uploadData.productName || 'New product'
  const imageCount = uploadData.imageCount || 0
  const statusLabel = uploadProgress < 30
    ? 'STARTING'
    : uploadProgress < 80
      ? 'UPLOADING'
      : uploadProgress < 95
        ? 'PROCESSING'
        : 'FINALIZING'

  // Show real-time file processing info
  const getFileProgress = () => {
    if (currentImage > 0 && totalImages > 0) {
      return `${currentImage}/${totalImages} files processed`
    }
    return `Processing ${imageCount} file${imageCount !== 1 ? 's' : ''}...`
  }

  const description = uploadProgress < 30
    ? 'Initializing secure connection...'
    : uploadProgress < 80
      ? getFileProgress()
      : uploadProgress < 95
        ? 'Optimizing data...'
        : 'Finalizing creation...'

  const timerLabel = uploadProgress < 30
    ? `${Math.floor(uploadProgress / 30 * 2)}s remaining`
    : uploadProgress < 80
      ? `${Math.floor((80 - uploadProgress) / 50 * 4)}s remaining`
      : uploadProgress < 95
        ? `${Math.floor((95 - uploadProgress) / 15 * 2)}s remaining`
        : 'Almost complete...'

  return (
    <div className="w-full">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 animate-pulse rounded-xl"></div>
      <div className="relative w-full py-3">
        <div className="block sm:hidden space-y-3">
          <div className="flex items-center justify-between bg-gradient-to-r from-slate-800/90 to-blue-800/90 rounded-xl p-3 border border-blue-500/30 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-lg animate-pulse"></div>
                <svg className="absolute inset-0 w-8 h-8 transform -rotate-90">
                  <circle cx="16" cy="16" r="12" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="2" fill="none" />
                  <circle cx="16" cy="16" r="12" stroke="url(#progressGradientMobile)" strokeWidth="2" fill="none"
                    strokeDasharray={`${2 * Math.PI * 12}`}
                    strokeDashoffset={`${2 * Math.PI * 12 * (1 - uploadProgress / 100)}`}
                    className="transition-all duration-500 ease-out" />
                  <defs>
                    <linearGradient id="progressGradientMobile" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="50%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#3B82F6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-white drop-shadow-lg">{uploadProgress}%</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-bold text-white truncate mb-1 drop-shadow">Creating "{productName}"</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                  <p className="text-xs text-blue-200 font-medium">{description}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-lg px-3 py-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-blue-300">{statusLabel}</span>
                {uploadProgress === 100 && onDismiss && (
                  <button
                    onClick={onDismiss}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                    title="Dismiss progress bar"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-lg"></div>
              <div className="relative bg-slate-700/50 rounded-full h-2 overflow-hidden border border-blue-500/30 shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-full transition-all duration-700 ease-out relative shadow-lg shadow-blue-500/50"
                  style={{ width: `${uploadProgress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-70 animate-pulse"></div>
                  <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-blue-300 font-medium">{description}</span>
              <div className="flex items-center space-x-2">
                <span className="text-gray-400">{timerLabel}</span>
                {uploadProgress === 100 && onDismiss && (
                  <button
                    onClick={onDismiss}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                    title="Dismiss progress bar"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="hidden md:block lg:hidden">
          <div className="bg-gradient-to-r from-slate-800/90 to-blue-800/90 rounded-xl p-4 border border-blue-500/30 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative w-10 h-10">
                  <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-lg animate-pulse"></div>
                  <svg className="absolute inset-0 w-10 h-10 transform -rotate-90">
                    <circle cx="20" cy="20" r="16" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="2" fill="none" />
                    <circle cx="20" cy="20" r="16" stroke="url(#progressGradientDesktop)" strokeWidth="2" fill="none"
                      strokeDasharray={`${2 * Math.PI * 16}`}
                      strokeDashoffset={`${2 * Math.PI * 16 * (1 - uploadProgress / 100)}`}
                      className="transition-all duration-500 ease-out" />
                    <defs>
                      <linearGradient id="progressGradientDesktop" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="50%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#3B82F6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-white drop-shadow-lg">{uploadProgress}%</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-white truncate mb-1 drop-shadow">Creating "{productName}"</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                    <p className="text-sm text-blue-200">{description}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-48 bg-slate-700/50 rounded-full h-3 overflow-hidden border border-blue-500/30">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-full transition-all duration-500 ease-out relative shadow-lg shadow-blue-500/50"
                    style={{ width: `${uploadProgress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-70 animate-pulse"></div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-lg px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-blue-300">{statusLabel}</span>
                    {uploadProgress === 100 && onDismiss && (
                      <button
                        onClick={onDismiss}
                        className="text-blue-400 hover:text-blue-300 transition-colors ml-2"
                        title="Dismiss progress bar"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:block">
          <div className="bg-gradient-to-r from-slate-800/90 to-blue-800/90 rounded-2xl p-6 border border-blue-500/30 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl animate-pulse"></div>
                  <svg className="absolute inset-0 w-12 h-12 transform -rotate-90">
                    <circle cx="24" cy="24" r="20" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="3" fill="none" />
                    <circle cx="24" cy="24" r="20" stroke="url(#progressGradientLarge)" strokeWidth="3" fill="none"
                      strokeDasharray={`${2 * Math.PI * 20}`}
                      strokeDashoffset={`${2 * Math.PI * 20 * (1 - uploadProgress / 100)}`}
                      className="transition-all duration-500 ease-out" />
                    <defs>
                      <linearGradient id="progressGradientLarge" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="50%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#3B82F6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-base font-bold text-white drop-shadow-lg">{uploadProgress}%</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white truncate mb-2 drop-shadow">Creating "{productName}"</h3>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                    <p className="text-base text-blue-200">{description}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="w-64 bg-slate-700/50 rounded-full h-4 overflow-hidden border border-blue-500/30 shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-full transition-all duration-700 ease-out relative shadow-lg shadow-blue-500/50"
                    style={{ width: `${uploadProgress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-70 animate-pulse"></div>
                    <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-xl px-6 py-3 shadow-lg">
                  <div className="flex flex-col items-center space-y-1">
                    <span className="text-lg font-semibold text-blue-300">{statusLabel}</span>
                    <span className="text-sm text-gray-400">{timerLabel}</span>
                    {uploadProgress === 100 && onDismiss && (
                      <button
                        onClick={onDismiss}
                        className="text-blue-400 hover:text-blue-300 transition-colors mt-2 text-sm"
                        title="Dismiss progress bar"
                      >
                        Dismiss ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden sm:block md:hidden">
          <div className="bg-gradient-to-r from-slate-800/90 to-blue-800/90 rounded-xl p-4 border border-blue-500/30 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative w-9 h-9">
                  <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-lg animate-pulse"></div>
                  <svg className="absolute inset-0 w-9 h-9 transform -rotate-90">
                    <circle cx="18" cy="18" r="14" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="2" fill="none" />
                    <circle cx="18" cy="18" r="14" stroke="url(#progressGradientTablet)" strokeWidth="2" fill="none"
                      strokeDasharray={`${2 * Math.PI * 14}`}
                      strokeDashoffset={`${2 * Math.PI * 14 * (1 - uploadProgress / 100)}`}
                      className="transition-all duration-500 ease-out" />
                    <defs>
                      <linearGradient id="progressGradientTablet" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="50%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#3B82F6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-white drop-shadow-lg">{uploadProgress}%</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-white truncate mb-1 drop-shadow">Creating "{productName}"</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                    <p className="text-xs text-blue-200">{description}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-36 bg-slate-700/50 rounded-full h-2 overflow-hidden border border-blue-500/30">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-full transition-all duration-500 ease-out relative shadow-lg shadow-blue-500/50"
                    style={{ width: `${uploadProgress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-70 animate-pulse"></div>
                  </div>
                </div>
                {uploadProgress === 100 && onDismiss && (
                  <button
                    onClick={onDismiss}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                    title="Dismiss progress bar"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UploadProgressBar
