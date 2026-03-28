// Utility functions for demo mode
export const enableDemoMode = () => {
  localStorage.setItem('demo-mode', 'true')
  console.log('Demo mode enabled! Using mock data.')
}

// Disable demo mode (use real API)
export const disableDemoMode = () => {
  localStorage.removeItem('demo-mode')
  console.log('Demo mode disabled! Using real API.')
}

// Toggle demo mode
export const toggleDemoMode = () => {
  if (isDemoMode()) {
    disableDemoMode()
  } else {
    enableDemoMode()
  }
}

// Auto-enable demo mode if no backend is available
export const autoEnableDemoMode = () => {
  // Check if we're in development and demo mode isn't explicitly set
  if (import.meta.env.DEV && !localStorage.getItem('demo-mode')) {
    // Enable demo mode by default in development
    enableDemoMode()
  }
}

// Get current demo mode status
export const getDemoModeStatus = () => {
  return {
    isDemoMode: isDemoMode(),
    message: isDemoMode() ? 'Using demo data' : 'Using live API'
  }
}

// Flag to control demo mode (can be toggled via localStorage)
export const isDemoMode = () => {
  // return localStorage.getItem('demo-mode') === 'true'
  return false;
}

export const setDemoMode = (enabled) => {
  if (enabled) {
    localStorage.setItem('demo-mode', 'true')
  } else {
    localStorage.removeItem('demo-mode')
  }
}
