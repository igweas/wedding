import React, { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent } from './ui/card'
import { UploadCloudIcon, ImageIcon, VideoIcon, XIcon } from 'lucide-react'

export default function GuestUploadPage({ albumName, onBack }) {
  const [selectedFiles, setSelectedFiles] = useState([])
  const [uploaderName, setUploaderName] = useState('')
  const [message, setMessage] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files)
    setSelectedFiles(prev => [...prev, ...files])
  }

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return
    
    setIsUploading(true)
    // Simulate upload process
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Reset form
    setSelectedFiles([])
    setUploaderName('')
    setMessage('')
    setIsUploading(false)
    
    alert('Files uploaded successfully!')
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const triggerFileInput = () => {
    document.getElementById('file-upload').click()
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-2 text-gray-900">{albumName}</h1>
          <Button 
            variant="outline" 
            onClick={onBack}
            className="text-amber-600 border-amber-600 hover:bg-amber-600 hover:text-white"
          >
            Jump to Gallery >>>
          </Button>
        </div>
      </div>

      {/* Upload Section */}
      <div className="max-w-2xl mx-auto p-6">
        <Card className="bg-white border-gray-200">
          <CardContent className="p-8 text-center">
            <p className="text-amber-600 mb-6 text-lg font-medium">
              UPLOAD PICTURES OR VIDEOS YOU WANT TO SHARE.<br />
              REMAIN ON PAGE UNTIL ALL UPLOADS COMPLETE.
            </p>
            
            <div className="mb-8">
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <Button 
                onClick={triggerFileInput}
                className="bg-gray-900 text-white hover:bg-gray-800 px-8 py-3 text-lg"
              >
                <UploadCloudIcon className="mr-2 h-5 w-5" />
                BROWSE FILES
              </Button>
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Selected Files ({selectedFiles.length})</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-100 p-3 rounded">
                      <div className="flex items-center">
                        {file.type.startsWith('image/') ? (
                          <ImageIcon className="h-4 w-4 mr-2 text-blue-600" />
                        ) : (
                          <VideoIcon className="h-4 w-4 mr-2 text-red-600" />
                        )}
                        <span className="text-sm text-gray-900">{file.name}</span>
                        <span className="text-xs text-gray-500 ml-2">({formatFileSize(file.size)})</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Message Form */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <span className="text-amber-600 mr-2 font-medium">Please leave a message ▼</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Personalize your upload with a name and a message.<br />
                Submit with file upload.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Name</label>
                  <Input
                    value={uploaderName}
                    onChange={(e) => setUploaderName(e.target.value)}
                    placeholder="NAME"
                    className="bg-white text-gray-900 border-gray-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="TYPE IN YOUR MESSAGE"
                    className="w-full h-24 px-3 py-2 bg-white text-gray-900 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    maxLength={255}
                  />
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {message.length}/255
                  </div>
                </div>
              </div>
            </div>

            {/* Upload Button */}
            <div className="mt-8">
              <Button
                onClick={handleUpload}
                disabled={selectedFiles.length === 0 || isUploading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? 'Uploading...' : 'Upload Files'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <div className="mt-8 text-center">
          <h3 className="text-xl font-bold mb-4 text-amber-600">HOW TO UPLOAD?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-2">
                01
              </div>
              <h4 className="font-semibold mb-1 text-gray-900">Click Browse Files</h4>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-2">
                02
              </div>
              <h4 className="font-semibold mb-1 text-gray-900">Select Your Files</h4>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-2">
                03
              </div>
              <h4 className="font-semibold mb-1 text-gray-900">Click Upload</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}