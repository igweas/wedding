import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent } from './ui/card'
import { UploadCloudIcon, ImageIcon, VideoIcon, XIcon, LoaderIcon, CheckIcon } from 'lucide-react'
import { getCurrentUser, uploadFileToDrive } from '../utils/googleApi'

export default function GuestUploadPage({ albumName, album, onBack }) {
  const [selectedFiles, setSelectedFiles] = useState([])
  const [uploaderName, setUploaderName] = useState('')
  const [message, setMessage] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({})
  const [uploadComplete, setUploadComplete] = useState(false)

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files)
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/')
      const isVideo = file.type.startsWith('video/')
      return isImage || isVideo
    })
    setSelectedFiles(prev => [...prev, ...validFiles])
  }

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || !selectedGroup) return
    
    setIsUploading(true)
    setUploadProgress({})
    setUploadComplete(false)
    
    try {
      // Find the selected group's folder ID
      const group = album?.groups?.find(g => g.name === selectedGroup)
      const folderId = group?.folderId
      
      if (!folderId) {
        throw new Error('Group folder not found. Please contact the event organizer.')
      }

      // Upload each file
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        const fileName = `${uploaderName ? `${uploaderName}_` : ''}${file.name}`
        
        setUploadProgress(prev => ({
          ...prev,
          [i]: { status: 'uploading', progress: 0 }
        }))

        try {
          await uploadFileToDrive(file, folderId, fileName)
          setUploadProgress(prev => ({
            ...prev,
            [i]: { status: 'completed', progress: 100 }
          }))
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error)
          setUploadProgress(prev => ({
            ...prev,
            [i]: { status: 'error', progress: 0, error: error.message }
          }))
        }
      }

      setUploadComplete(true)
      
      // Reset form after successful upload
      setTimeout(() => {
        setSelectedFiles([])
        setUploaderName('')
        setMessage('')
        setSelectedGroup('')
        setUploadProgress({})
        setUploadComplete(false)
      }, 3000)
      
    } catch (error) {
      console.error('Upload failed:', error)
      alert(`Upload failed: ${error.message}`)
    } finally {
      setIsUploading(false)
    }
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

  const completedUploads = Object.values(uploadProgress).filter(p => p.status === 'completed').length
  const failedUploads = Object.values(uploadProgress).filter(p => p.status === 'error').length

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
            
            {/* Group Selection */}
            {album?.groups && album.groups.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Group/Category:
                </label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="w-full px-3 py-2 bg-white text-gray-900 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Choose a group...</option>
                  {album.groups.map((group) => (
                    <option key={group.id} value={group.name}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
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
                disabled={isUploading}
                className="bg-gray-900 text-white hover:bg-gray-800 px-8 py-3 text-lg disabled:opacity-50"
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
                      <div className="flex items-center flex-1">
                        {file.type.startsWith('image/') ? (
                          <ImageIcon className="h-4 w-4 mr-2 text-blue-600" />
                        ) : (
                          <VideoIcon className="h-4 w-4 mr-2 text-red-600" />
                        )}
                        <span className="text-sm text-gray-900 truncate">{file.name}</span>
                        <span className="text-xs text-gray-500 ml-2">({formatFileSize(file.size)})</span>
                      </div>
                      
                      {/* Upload Progress */}
                      {uploadProgress[index] && (
                        <div className="flex items-center ml-2">
                          {uploadProgress[index].status === 'uploading' && (
                            <LoaderIcon className="h-4 w-4 animate-spin text-blue-600" />
                          )}
                          {uploadProgress[index].status === 'completed' && (
                            <CheckIcon className="h-4 w-4 text-green-600" />
                          )}
                          {uploadProgress[index].status === 'error' && (
                            <span className="text-xs text-red-600">Failed</span>
                          )}
                        </div>
                      )}
                      
                      {!isUploading && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-2"
                        >
                          <XIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Upload Summary */}
                {isUploading && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Uploading to Google Drive... {completedUploads}/{selectedFiles.length} completed
                      {failedUploads > 0 && `, ${failedUploads} failed`}
                    </p>
                  </div>
                )}
                
                {uploadComplete && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800 font-medium">
                      Upload completed! {completedUploads} files uploaded successfully.
                      {failedUploads > 0 && ` ${failedUploads} files failed to upload.`}
                    </p>
                  </div>
                )}
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
                    disabled={isUploading}
                    className="bg-white text-gray-900 border-gray-300 disabled:opacity-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="TYPE IN YOUR MESSAGE"
                    disabled={isUploading}
                    className="w-full h-24 px-3 py-2 bg-white text-gray-900 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:opacity-50"
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
                disabled={selectedFiles.length === 0 || isUploading || !selectedGroup}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <LoaderIcon className="mr-2 h-5 w-5 animate-spin" />
                    Uploading... ({completedUploads}/{selectedFiles.length})
                  </>
                ) : (
                  'Upload Files'
                )}
              </Button>
              
              {!selectedGroup && selectedFiles.length > 0 && (
                <p className="text-sm text-red-600 mt-2">Please select a group before uploading</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <div className="mt-8 text-center">
          <h3 className="text-xl font-bold mb-4 text-amber-600">HOW TO UPLOAD?</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-2">
                01
              </div>
              <h4 className="font-semibold mb-1 text-gray-900">Select Group</h4>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-2">
                02
              </div>
              <h4 className="font-semibold mb-1 text-gray-900">Browse Files</h4>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-2">
                03
              </div>
              <h4 className="font-semibold mb-1 text-gray-900">Add Message</h4>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-2">
                04
              </div>
              <h4 className="font-semibold mb-1 text-gray-900">Upload</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}