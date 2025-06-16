import React, { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, GoogleIcon, CalendarIcon, FolderIcon, UserIcon } from 'lucide-react'

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
  const [albumData, setAlbumData] = useState({
    eventName: '',
    selectedGroups: [],
    eventDate: '',
    googleAccount: null,
    isGoogleConnected: false
  })

  const handleNext = () => {
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

  const handleGoogleConnect = () => {
    // Simulate Google OAuth flow
    setAlbumData(prev => ({
      ...prev,
      googleAccount: 'stanley.a.igwe@gmail.com',
      isGoogleConnected: true
    }))
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
        description: `Photos and videos for ${groupName}`
      })),
      googleAccount: albumData.googleAccount
    }
    onComplete(newAlbum)
  }

  const canProceedStep1 = albumData.eventName.trim() && albumData.selectedGroups.length > 0 && albumData.eventDate
  const canProceedStep2 = albumData.isGoogleConnected
  const canProceedStep3 = true // Confirmation step
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
                    <Button
                      onClick={handleGoogleConnect}
                      className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3"
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Sign in with Google
                    </Button>
                  ) : (
                    <div className="bg-green-100 text-green-800 p-4 rounded-lg">
                      <div className="flex items-center justify-center mb-2">
                        <CheckIcon className="h-5 w-5 mr-2" />
                        <span className="font-medium">Connected Successfully!</span>
                      </div>
                      <p className="text-sm">
                        Account: {albumData.googleAccount}
                      </p>
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
                <div className="bg-gray-900 text-white p-6 rounded-lg text-center">
                  <div className="w-16 h-16 bg-amber-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <UserIcon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">You're signing back in to WedUploader</h3>
                  <div className="bg-gray-800 rounded-lg p-3 mb-4">
                    <span className="text-amber-400">{albumData.googleAccount}</span>
                  </div>
                  <p className="text-gray-300 text-sm mb-6">
                    Review WedUploader's privacy policy and Terms of Service to understand how WedUploader will process and protect your data.
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button variant="outline" className="text-gray-300 border-gray-600 hover:bg-gray-800">
                      Cancel
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      Continue
                    </Button>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                  <h4 className="font-medium text-amber-800 mb-2">Integration Summary</h4>
                  <div className="text-sm text-amber-700 space-y-1">
                    <p><strong>Event:</strong> {albumData.eventName}</p>
                    <p><strong>Date:</strong> {new Date(albumData.eventDate).toLocaleDateString()}</p>
                    <p><strong>Groups:</strong> {albumData.selectedGroups.length} selected</p>
                    <p><strong>Google Account:</strong> {albumData.googleAccount}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <input type="checkbox" id="terms" className="mt-1 rounded border-gray-300 text-amber-600 focus:ring-amber-500" />
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    I have read and approve the Google Drive integration and understand that WedUploader will create folders and store uploaded content in my Google Drive account.
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
                    Your album "{albumData.eventName}" has been created with {albumData.selectedGroups.length} groups.
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Selected Groups:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {albumData.selectedGroups.map((group, index) => (
                      <div key={index} className="bg-white p-2 rounded border text-sm text-gray-700">
                        {group}
                      </div>
                    ))}
                  </div>
                </div>

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
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </Button>

            {currentStep < 4 ? (
              <Button
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !canProceedStep1) ||
                  (currentStep === 2 && !canProceedStep2)
                }
                className="bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ArrowRightIcon className="ml-2 h-4 w-4" />
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