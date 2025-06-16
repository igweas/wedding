import React, { useState } from 'react'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from './ui/dropdown'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { ArrowUpIcon, ArrowDownIcon, ImageIcon, VideoIcon, TrashIcon, FilterIcon } from 'lucide-react'

// Sample images for demonstration
const sampleImages = [
  { id: 1, url: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800', type: 'image', uploadedAt: new Date('2024-01-15'), dateTaken: new Date('2024-01-10') },
  { id: 2, url: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=800', type: 'image', uploadedAt: new Date('2024-01-16'), dateTaken: new Date('2024-01-11') },
  { id: 3, url: 'https://images.pexels.com/photos/1024967/pexels-photo-1024967.jpeg?auto=compress&cs=tinysrgb&w=800', type: 'image', uploadedAt: new Date('2024-01-17'), dateTaken: new Date('2024-01-12') },
  { id: 4, url: 'https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg?auto=compress&cs=tinysrgb&w=800', type: 'image', uploadedAt: new Date('2024-01-18'), dateTaken: new Date('2024-01-13') },
  { id: 5, url: 'https://images.pexels.com/photos/1024960/pexels-photo-1024960.jpeg?auto=compress&cs=tinysrgb&w=800', type: 'image', uploadedAt: new Date('2024-01-19'), dateTaken: new Date('2024-01-14') },
  { id: 6, url: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=800', type: 'image', uploadedAt: new Date('2024-01-20'), dateTaken: new Date('2024-01-15') },
  { id: 7, url: 'https://images.pexels.com/photos/1024966/pexels-photo-1024966.jpeg?auto=compress&cs=tinysrgb&w=800', type: 'image', uploadedAt: new Date('2024-01-21'), dateTaken: new Date('2024-01-16') },
  { id: 8, url: 'https://images.pexels.com/photos/1043472/pexels-photo-1043472.jpeg?auto=compress&cs=tinysrgb&w=800', type: 'image', uploadedAt: new Date('2024-01-22'), dateTaken: new Date('2024-01-17') },
]

export default function GalleryPage({ albumName, onBack, isModerator = false }) {
  const [images, setImages] = useState(sampleImages)
  const [sortBy, setSortBy] = useState('uploadedTime')
  const [sortOrder, setSortOrder] = useState('desc')
  const [filterBy, setFilterBy] = useState('all')
  const [selectedImage, setSelectedImage] = useState(null)
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const [imageToRemove, setImageToRemove] = useState(null)

  const sortedAndFilteredImages = images
    .filter(image => {
      if (filterBy === 'all') return true
      return image.type === filterBy
    })
    .sort((a, b) => {
      const dateA = sortBy === 'uploadedTime' ? a.uploadedAt : a.dateTaken
      const dateB = sortBy === 'uploadedTime' ? b.uploadedAt : b.dateTaken
      
      if (sortOrder === 'asc') {
        return dateA - dateB
      } else {
        return dateB - dateA
      }
    })

  const handleRemoveImage = (imageId) => {
    setImages(prev => prev.filter(img => img.id !== imageId))
    setShowRemoveDialog(false)
    setImageToRemove(null)
  }

  const confirmRemove = (image) => {
    setImageToRemove(image)
    setShowRemoveDialog(true)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isModerator ? `Delete from Gallery: ${albumName}` : 'Gallery'}
            </h1>
            {isModerator && (
              <div className="mt-2 space-y-1 text-sm text-gray-600">
                <p><span className="text-red-600 font-medium">Caution:</span> This page provides any user the ability to remove an image from Event Gallery Upload. It is intended to provide guests and the wedding couple the capability to correct an accidental upload or remove from public view any images deemed inappropriate by any user.</p>
                <p><span className="text-amber-600 font-medium">Note:</span> When an image is removed, it is hidden from public view on Event Gallery Upload. However, the file remains in the wedding couple's Google Drive and the wedding couple has the capability to re-instate images at their discretion.</p>
                <p><span className="text-blue-600 font-medium">Instructions:</span> Click the red trash can button on the image you would like to remove and then confirm your choice on the pop-up.</p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            {isModerator && (
              <Button 
                variant="outline" 
                onClick={onBack}
                className="text-amber-600 border-amber-600 hover:bg-amber-600 hover:text-white"
              >
                Return to Upload Gallery
              </Button>
            )}
            <Button 
              variant="outline" 
              className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
            >
              Need to Remove File?
            </Button>
            
            {/* Sort/Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="outline" className="text-gray-700 border-gray-300 hover:bg-gray-50">
                  <FilterIcon className="mr-2 h-4 w-4" />
                  Sort / Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white border-gray-200">
                <div className="px-3 py-2 text-sm font-semibold text-gray-700 border-b border-gray-200">
                  Sort by uploaded time
                </div>
                <DropdownMenuItem 
                  onClick={() => { setSortBy('uploadedTime'); setSortOrder('desc') }}
                  className="text-gray-700 hover:bg-gray-100"
                >
                  <ArrowDownIcon className="mr-2 h-4 w-4" />
                  Newest first
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => { setSortBy('uploadedTime'); setSortOrder('asc') }}
                  className="text-gray-700 hover:bg-gray-100"
                >
                  <ArrowUpIcon className="mr-2 h-4 w-4" />
                  Oldest first
                </DropdownMenuItem>
                
                <div className="px-3 py-2 text-sm font-semibold text-gray-700 border-b border-gray-200 mt-2">
                  Sort by date taken
                </div>
                <DropdownMenuItem 
                  onClick={() => { setSortBy('dateTaken'); setSortOrder('desc') }}
                  className="text-gray-700 hover:bg-gray-100"
                >
                  <ArrowDownIcon className="mr-2 h-4 w-4" />
                  Newest first
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => { setSortBy('dateTaken'); setSortOrder('asc') }}
                  className="text-gray-700 hover:bg-gray-100"
                >
                  <ArrowUpIcon className="mr-2 h-4 w-4" />
                  Oldest first
                </DropdownMenuItem>
                
                <div className="px-3 py-2 text-sm font-semibold text-gray-700 border-b border-gray-200 mt-2">
                  Filter by
                </div>
                <DropdownMenuItem 
                  onClick={() => setFilterBy('all')}
                  className="text-gray-700 hover:bg-gray-100"
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  All files
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setFilterBy('image')}
                  className="text-gray-700 hover:bg-gray-100"
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Images only
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setFilterBy('video')}
                  className="text-gray-700 hover:bg-gray-100"
                >
                  <VideoIcon className="mr-2 h-4 w-4" />
                  Videos only
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedAndFilteredImages.map((image) => (
            <div key={image.id} className="relative group">
              <div 
                className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity border border-gray-200"
                onClick={() => setSelectedImage(image)}
              >
                <img
                  src={image.url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Remove button for moderators */}
              {isModerator && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    confirmRemove(image)
                  }}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              )}
              
              {/* Watermark */}
              <div className="absolute bottom-2 right-2 text-gray-600 text-xs opacity-50">
                📷
              </div>
            </div>
          ))}
        </div>

        {sortedAndFilteredImages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No images found matching your filters.</p>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl max-h-full">
            <img
              src={selectedImage.url}
              alt=""
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300"
          >
            ×
          </button>
        </div>
      )}

      {/* Remove Confirmation Dialog */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent className="bg-white text-gray-900 border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Confirm Removal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-700">Are you sure you want to remove this image from the gallery?</p>
            <p className="text-sm text-gray-500">
              This will hide the image from public view, but it will remain in the couple's Google Drive.
            </p>
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowRemoveDialog(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => handleRemoveImage(imageToRemove.id)}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                Remove Image
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}