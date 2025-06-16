import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, FolderIcon, UserIcon, AlertCircleIcon, LoaderIcon, RefreshCwIcon } from 'lucide-react'
import { 
  initializeGapi, 
  signInWithGoogle, 
  signInWithGoogleRedirect,
  handleRedirectCallback,
  signOutFromGoogle, 
  isSignedIn, 
  getCurrentUser,
  createEventFolderStructure 
} from '../utils/googleApi'

const defaultGroups = [
  "Pre Wedding",
  "Engagement/Proposal", 
  "Ceremony",
  "Post Wedding",
  "Traditional",
  "After Party",
  "Reception",
  "Bridal Party",
  "Family Photos",
  "Candid Moments"
]

export default function CreateAlbumWizard({ onComplete, onCancel }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPopupHelp, setShowPopupHelp] = useState(false)
  const [albumData, setAlbumData] = useState({
    eventName: '',
    selectedGroups: [],
    eventDate: '',
    googleAccount: null,
    isGoogleConnected: false,
    driveStructure: null,
    termsAccepted: false
  })

  useEffect(() => {
    // Initialize Google API when component mounts
    const initGoogle = async () => {
      try {
        await initializeGapi()
        
        // Check for redirect callback first
        const redirectUser = await handleRedirectCallback()
        if (redirectUser) {
          setAlbumData(prev => ({
            ...prev,
            googleAccount: redirectUser,
            isGoogleConnected: true
          }))
          setCurrentStep(3) // Move to confirmation step after successful redirect
          return
        }
        
        // Check if user is already signed in
        if (isSignedIn()) {
          const user = getCurrentUser()
          setAlbumData(prev => ({
            ...prev,
            googleAccount: user,
            isGoogleConnected: true
          }))
        }
      } catch (error) {
        console.error('Failed to initialize Google API:', error)
        
        // Provide more specific error messages
        if (error.message.includes('domain verification')) {
          setError('This application is currently in development mode and requires domain verification. Please contact the developer to add your domain to the authorized origins, or try accessing the application from localhost.')
        } else if (error.message.includes('credentials not configured')) {
          setError('Google API credentials are not properly configured. Please check the .env file configuration.')
        } else {
          setError('Failed to initialize Google services. This may be due to domain verification requirements in the development environment.')
        }
      }
    }

    initGoogle()
  }, [])

  const handleNext = async () => {
    if (currentStep === 2 && albumData.isGoogleConnected) {
      // Create Drive folder structure when moving from step 2 to 3
      await handleCreateDriveStructure()
    }
    
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleGroupToggle = (group) => {
    setAlbumData(prev => ({
      ...prev,
      selectedGroups: prev.selectedGroups.includes(group)
        ? prev.selectedGroups.filter(g => g !== group)
        : [...prev.selectedGroups, group]
    }))
  }

  const handleGoogleConnect = async () => {
    setIsLoading(true)
    setError('')
    setShowPopupHelp(false)
    
    try {
      const user = await signInWithGoogle()
      setAlbumData(prev => ({
        ...prev,
        googleAccount: user,
        isGoogleConnected: true
      }))
      
      // Automatically proceed to next step after successful authentication
      setTimeout(() => {
        setCurrentStep(3)
      }, 1000)
      
    } catch (error) {
      console.error('Google sign-in failed:', error)
      
      // Handle popup blocking specifically
      if (error.message === 'popup_blocked' || error.message === 'popup_closed_by_user') {
        setShowPopupHelp(true)
        setError('Your browser is blocking the sign-in popup. Please use the "Alternative Sign-in" button below, or allow popups for this site in your browser settings.')
      } else if (error.message.includes('domain verification') || error.message.includes('access_denied')) {
        setError('This application requires domain verification to access Google services. In development mode, please ensure your domain is added to the Google Cloud Console authorized origins, or contact the developer for assistance.')
      } else if (error.message.includes('popup_closed_by_user')) {
        setError('Sign-in was cancelled. Please try again.')
      } else {
        // For any other error that might be popup-related, show the alternative option
        setShowPopupHelp(true)
        setError('Failed to connect to Google. Please try the alternative sign-in method below.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleConnectRedirect = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      await signInWithGoogleRedirect()
      // The page will redirect, so we don't need to handle the response here
    } catch (error) {
      console.error('Google redirect sign-in failed:', error)
      
      // Handle popup blocking specifically for redirect method
      if (error.message === 'popup_blocked' || error.message.includes('popup_blocked')) {
        setError('Both sign-in methods are being blocked by your browser. Please allow popups for this site in your browser settings and try again. You may also need to try a different browser or disable popup blockers temporarily.')
      } else if (error.message.includes('domain verification') || error.message.includes('access_denied')) {
        setError('This application requires domain verification to access Google services. In development mode, please ensure your domain is added to the Google Cloud Console authorized origins, or contact the developer for assistance.')
      } else {
        setError('Failed to initiate Google sign-in. This may be due to browser security settings or popup blocking. Please ensure popups are allowed for this site and try again.')
      }
      setIsLoading(false)
    }
  }

  const handleGoogleDisconnect = async () => {
    try {
      await signOutFromGoogle()
      setAlbumData(prev => ({
        ...prev,
        googleAccount: null,
        isGoogleConnected: false,
        driveStructure: null
      }))
      // Go back to step 2 after disconnecting
      setCurrentStep(2)
    } catch (error) {
      console.error('Google sign-out failed:', error)
    }
  }

  const handleCreateDriveStructure = async () => {
    if (!albumData.isGoogleConnected || !albumData.eventName || albumData.selectedGroups.length === 0) {
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const groups = albumData.selectedGroups.map((groupName, index) => ({
        id: Date.now() + index,
        name: groupName,
        description: `Photos and videos for ${groupName}`
      }))

      const driveStructure = await createEventFolderStructure(albumData.eventName, groups)
      
      setAlbumData(prev => ({
        ...prev,
        driveStructure
      }))
    } catch (error) {
      console.error('Failed to create Drive folder structure:', error)
      setError('Failed to create folders in Google Drive. Please check your permissions and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleComplete = () => {
    const newAlbum = {
      id: Date.now(),
      name: albumData.eventName,
      date: new Date(albumData.eventDate).toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }),
      shareUrl: `https://weduploader.com/upload/${albumData.eventName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      groups: albumData.selectedGroups.map((groupName, index) => ({
        id: Date.now() + index,
        name: groupName,
        description: `Photos and videos for ${groupName}`,
        folderId: albumData.driveStructure?.groupFolders?.find(gf => gf.name === groupName)?.folderId
      })),
      googleAccount: albumData.googleAccount,
      driveStructure: albumData.driveStructure
    }
    onComplete(newAlbum)
  }

  const canProceedStep1 = albumData.eventName.trim() && albumData.selectedGroups.length > 0 && albumData.eventDate
  const canProceedStep2 = albumData.isGoogleConnected && !isLoading
  const canProceedStep3 = albumData.termsAccepted && albumData.driveStructure
  const canComplete = canProceedStep1 && canProceedStep2 && canProceedStep3

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep 
                    ? 'bg-amber-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step < currentStep ? <CheckIcon className="h-4 w-4" /> : step}
                </div>
                {step < 4 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step < currentStep ? 'bg-amber-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>Event Details</span>
            <span>Google Integration</span>
            <span>Confirmation</span>
            <span>Manage Groups</span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
            <AlertCircleIcon className="h-5 w-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
              {!showPopupHelp && (
                <div className="mt-2 text-xs text-red-600">
                  <p><strong>Development Note:</strong> This error typically occurs in development environments due to Google's domain verification requirements.</p>
                  <p><strong>Solution:</strong> Add your current domain to the Google Cloud Console authorized origins, or contact the developer for assistance.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Popup Help Display */}
        {showPopupHelp && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircleIcon className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-blue-800 font-medium">Popup Blocked - Use Alternative Sign-in</p>
                <p className="text-blue-700 text-sm mb-3">Your browser blocked the Google sign-in popup. This is common with popup blockers and browser security settings.</p>
                <div className="space-y-2 text-sm text-blue-700">
                  <p><strong>Quick Solution:</strong> Click the "Alternative Sign-in (Redirect)" button below - this will work even with popup blockers enabled.</p>
                  <p><strong>Or fix popup blocking:</strong></p>
                  <ul className="ml-4 list-disc space-y-1 text-xs">
                    <li>Look for a popup blocker icon in your address bar and click "Allow"</li>
                    <li>Add this site to your browser's popup exceptions</li>
                    <li>Try a different browser (Chrome, Firefox, Safari)</li>
                    <li>Temporarily disable ad blockers or popup blockers</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        <Card className="bg-white border-gray-200 shadow-lg">
          <CardHeader className="text-center border-b border-gray-200">
            <CardTitle className="text-2xl text-amber-700">
              {currentStep === 1 && "Create New Album"}
              {currentStep === 2 && "Connect Google Account"}
              {currentStep === 3 && "Confirm Integration"}
              {currentStep === 4 && "Manage Groups"}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-8">
            {/* Step 1: Event Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="border-2 border-dashed border-amber-300 rounded-lg p-6">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Event Title:
                      </label>
                      <Input
                        value={albumData.eventName}
                        onChange={(e) => setAlbumData(prev => ({ ...prev, eventName: e.target.value }))}
                        placeholder="e.g., John & Emma's Wedding"
                        className="bg-white text-gray-900 border-gray-300"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Select Groups to Create:
                      </label>
                      <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                        {defaultGroups.map((group) => (
                          <label key={group} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={albumData.selectedGroups.includes(group)}
                              onChange={() => handleGroupToggle(group)}
                              className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                            />
                            <span className="text-sm text-gray-700">{group}</span>
                          </label>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Selected: {albumData.selectedGroups.length} groups
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of the Event:
                      </label>
                      <Input
                        type="date"
                        value={albumData.eventDate}
                        onChange={(e) => setAlbumData(prev => ({ ...prev, eventDate: e.target.value }))}
                        className="bg-white text-gray-900 border-gray-300"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Google Integration */}
            {currentStep === 2 && (
              <div className="space-y-6 text-center">
                <div className="bg-gray-900 text-white p-6 rounded-lg">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 bg-amber-600 rounded-lg flex items-center justify-center">
                      <FolderIcon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Connect to Google Drive</h3>
                  <p className="text-gray-300 mb-6">
                    We'll create a folder in your Google Drive to store all photos and videos from your event.
                    Your data remains private and under your control.
                  </p>
                  
                  {!albumData.isGoogleConnected ? (
                    <div className="space-y-4">
                      <Button
                        onClick={handleGoogleConnect}
                        disabled={isLoading}
                        className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 disabled:opacity-50 w-full"
                      >
                        {isLoading ? (
                          <LoaderIcon className="w-5 h-5 mr-2 animate-spin" />
                        ) : (
                          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                        )}
                        {isLoading ? 'Connecting...' : 'Sign in with Google (Popup)'}
                      </Button>
                      
                      {/* Always show the alternative sign-in button for better UX */}
                      <Button
                        onClick={handleGoogleConnectRedirect}
                        disabled={isLoading}
                        variant="outline"
                        className="bg-gray-100 text-gray-900 hover:bg-gray-200 px-8 py-3 disabled:opacity-50 w-full border-gray-300"
                      >
                        <RefreshCwIcon className="w-5 h-5 mr-2" />
                        Alternative Sign-in (Redirect)
                      </Button>
                      
                      <div className="text-xs text-gray-400 mt-2">
                        <p>💡 If the popup method doesn't work, use the alternative sign-in method above.</p>
                        <p>The redirect method works with all browsers and popup blockers.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-green-100 text-green-800 p-4 rounded-lg">
                      <div className="flex items-center justify-center mb-2">
                        <CheckIcon className="h-5 w-5 mr-2" />
                        <span className="font-medium">Connected Successfully!</span>
                      </div>
                      <div className="flex items-center justify-center mb-2">
                        {albumData.googleAccount?.imageUrl && (
                          <img 
                            src={albumData.googleAccount.imageUrl} 
                            alt="Profile" 
                            className="w-8 h-8 rounded-full mr-2"
                          />
                        )}
                        <div>
                          <p className="text-sm font-medium">{albumData.googleAccount?.name}</p>
                          <p className="text-xs">{albumData.googleAccount?.email}</p>
                        </div>
                      </div>
                      <Button
                        onClick={handleGoogleDisconnect}
                        variant="outline"
                        size="sm"
                        className="mt-2 text-green-700 border-green-300 hover:bg-green-200"
                      >
                        Use Different Account
                      </Button>
                    </div>
                  )}
                </div>

                <div className="text-left bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">What happens next?</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• A folder will be created in your Google Drive</li>
                    <li>• Subfolders for each group will be organized automatically</li>
                    <li>• All uploaded photos and videos will be stored there</li>
                    <li>• You maintain full control and ownership of your data</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {currentStep === 3 && (
              <div className="space-y-6">
                {isLoading && (
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-center">
                    <LoaderIcon className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    <p className="text-blue-800 font-medium">Creating folder structure in Google Drive...</p>
                    <p className="text-blue-600 text-sm">This may take a few moments</p>
                  </div>
                )}

                <div className="bg-gray-900 text-white p-6 rounded-lg text-center">
                  <div className="w-16 h-16 bg-amber-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <UserIcon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Integration Ready</h3>
                  <div className="bg-gray-800 rounded-lg p-3 mb-4 flex items-center justify-center">
                    {albumData.googleAccount?.imageUrl && (
                      <img 
                        src={albumData.googleAccount.imageUrl} 
                        alt="Profile" 
                        className="w-6 h-6 rounded-full mr-2"
                      />
                    )}
                    <span className="text-amber-400">{albumData.googleAccount?.email}</span>
                  </div>
                  <p className="text-gray-300 text-sm mb-6">
                    Your Google Drive integration is ready. We will create the necessary folders and organize your event photos automatically.
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                  <h4 className="font-medium text-amber-800 mb-2">Integration Summary</h4>
                  <div className="text-sm text-amber-700 space-y-1">
                    <p><strong>Event:</strong> {albumData.eventName}</p>
                    <p><strong>Date:</strong> {new Date(albumData.eventDate).toLocaleDateString()}</p>
                    <p><strong>Groups:</strong> {albumData.selectedGroups.length} selected</p>
                    <p><strong>Google Account:</strong> {albumData.googleAccount?.email}</p>
                    {albumData.driveStructure && (
                      <p><strong>Drive Folder:</strong> {albumData.driveStructure.mainFolderName}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <input 
                    type="checkbox" 
                    id="terms" 
                    checked={albumData.termsAccepted}
                    onChange={(e) => setAlbumData(prev => ({ ...prev, termsAccepted: e.target.checked }))}
                    className="mt-1 rounded border-gray-300 text-amber-600 focus:ring-amber-500" 
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    I have read and approve the Google Drive integration and understand that Event Gallery Upload will create folders and store uploaded content in my Google Drive account. I agree to the{' '}
                    <a href="#" className="text-blue-600 underline">Terms of Service</a> and{' '}
                    <a href="#" className="text-blue-600 underline">Privacy Policy</a>.
                  </label>
                </div>
              </div>
            )}

            {/* Step 4: Manage Groups Preview */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Album Created Successfully!
                  </h3>
                  <p className="text-gray-600">
                    Your album "{albumData.eventName}" has been created with {albumData.selectedGroups.length} groups and connected to Google Drive.
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Created Groups:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {albumData.selectedGroups.map((group, index) => (
                      <div key={index} className="bg-white p-2 rounded border text-sm text-gray-700 flex items-center">
                        <FolderIcon className="h-4 w-4 mr-2 text-green-600" />
                        {group}
                      </div>
                    ))}
                  </div>
                </div>

                {albumData.driveStructure && (
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Google Drive Structure:</h4>
                    <p className="text-sm text-blue-700">
                      <strong>Main Folder:</strong> {albumData.driveStructure.mainFolderName}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      All uploads will be organized into the respective group folders automatically.
                    </p>
                  </div>
                )}

                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    You can now manage your groups, add more, or start sharing your album with guests.
                  </p>
                  <Button
                    onClick={handleComplete}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3"
                  >
                    Go to Group Management
                  </Button>
                </div>
              </div>
            )}
          </CardContent>

          {/* Navigation Buttons */}
          <div className="border-t border-gray-200 p-6 flex justify-between">
            <Button
              variant="outline"
              onClick={currentStep === 1 ? onCancel : handleBack}
              disabled={isLoading}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </Button>

            {currentStep < 4 ? (
              <Button
                onClick={handleNext}
                disabled={
                  isLoading ||
                  (currentStep === 1 && !canProceedStep1) ||
                  (currentStep === 2 && !canProceedStep2) ||
                  (currentStep === 3 && !canProceedStep3)
                }
                className="bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Next
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckIcon className="mr-2 h-4 w-4" />
                Complete Setup
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}