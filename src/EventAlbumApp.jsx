import React, { useState, useEffect } from "react";
import { Card, CardContent } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/tabs";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./components/ui/dialog";
import { QrCodeIcon, Share2Icon, UploadCloudIcon, ExternalLinkIcon, CopyIcon, EyeIcon, TrashIcon, PlusIcon, ArrowLeftIcon } from "lucide-react";
import QRCode from 'qrcode';
import GuestUploadPage from './components/GuestUploadPage';
import GalleryPage from './components/GalleryPage';
import GroupManagementPage from './components/GroupManagementPage';
import CreateAlbumWizard from './components/CreateAlbumWizard';

export default function EventAlbumApp() {
  const [albums, setAlbums] = useState([]);
  const [newAlbumName, setNewAlbumName] = useState("");
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [showQrDialog, setShowQrDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'upload', 'gallery', 'moderator', 'groups', 'create-wizard'
  const [currentAlbum, setCurrentAlbum] = useState(null);

  // Load albums from localStorage on component mount
  useEffect(() => {
    const savedAlbums = localStorage.getItem('eventGalleryAlbums');
    if (savedAlbums) {
      try {
        const parsedAlbums = JSON.parse(savedAlbums);
        setAlbums(parsedAlbums);
      } catch (error) {
        console.error('Error loading albums from localStorage:', error);
        // Initialize with default album if localStorage is corrupted
        const defaultAlbums = [
          { 
            id: 1, 
            name: "John & Emma's Wedding", 
            date: "10th June 2025", 
            shareUrl: "https://weduploader.com/upload/john-emma-wedding",
            groups: [
              { id: 1, name: "Pre Wedding", description: "Engagement and pre-wedding photos" },
              { id: 2, name: "Ceremony", description: "Wedding ceremony moments" },
              { id: 3, name: "Reception", description: "Reception and party photos" }
            ]
          }
        ];
        setAlbums(defaultAlbums);
        localStorage.setItem('eventGalleryAlbums', JSON.stringify(defaultAlbums));
      }
    } else {
      // Initialize with default album if no data exists
      const defaultAlbums = [
        { 
          id: 1, 
          name: "John & Emma's Wedding", 
          date: "10th June 2025", 
          shareUrl: "https://weduploader.com/upload/john-emma-wedding",
          groups: [
            { id: 1, name: "Pre Wedding", description: "Engagement and pre-wedding photos" },
            { id: 2, name: "Ceremony", description: "Wedding ceremony moments" },
            { id: 3, name: "Reception", description: "Reception and party photos" }
          ]
        }
      ];
      setAlbums(defaultAlbums);
      localStorage.setItem('eventGalleryAlbums', JSON.stringify(defaultAlbums));
    }
  }, []);

  // Save albums to localStorage whenever albums change
  useEffect(() => {
    if (albums.length > 0) {
      localStorage.setItem('eventGalleryAlbums', JSON.stringify(albums));
    }
  }, [albums]);

  const createAlbum = () => {
    if (newAlbumName.trim()) {
      const newAlbum = {
        id: Date.now(),
        name: newAlbumName.trim(),
        date: new Date().toLocaleDateString('en-GB', { 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        }),
        shareUrl: `https://weduploader.com/upload/${newAlbumName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        groups: []
      };
      const updatedAlbums = [...albums, newAlbum];
      setAlbums(updatedAlbums);
      setNewAlbumName("");
      // Navigate to group management for the new album
      setCurrentAlbum(newAlbum);
      setCurrentView('groups');
    }
  };

  const startCreateWizard = () => {
    setCurrentView('create-wizard');
  };

  const handleWizardComplete = (newAlbum) => {
    const updatedAlbums = [...albums, newAlbum];
    setAlbums(updatedAlbums);
    setCurrentAlbum(newAlbum);
    setCurrentView('groups');
  };

  const handleWizardCancel = () => {
    setCurrentView('dashboard');
  };

  const generateQRCode = async (album) => {
    try {
      // Generate QR code for the upload page URL
      const uploadUrl = album.shareUrl;
      const qrDataUrl = await QRCode.toDataURL(uploadUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeUrl(qrDataUrl);
      setSelectedAlbum(album);
      setShowQrDialog(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const shareLink = (album) => {
    setSelectedAlbum(album);
    setShowShareDialog(true);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Link copied to clipboard!');
    });
  };

  const openUploadPage = (album) => {
    setCurrentAlbum(album);
    setCurrentView('upload');
  };

  const openGallery = (album, isModerator = false) => {
    setCurrentAlbum(album);
    setCurrentView(isModerator ? 'moderator' : 'gallery');
  };

  const openGroupManagement = (album) => {
    setCurrentAlbum(album);
    setCurrentView('groups');
  };

  const backToDashboard = () => {
    setCurrentView('dashboard');
    setCurrentAlbum(null);
  };

  const updateAlbumGroups = (albumId, groups) => {
    const updatedAlbums = albums.map(album => 
      album.id === albumId ? { ...album, groups } : album
    );
    setAlbums(updatedAlbums);
    // Update current album if it's the one being modified
    if (currentAlbum && currentAlbum.id === albumId) {
      setCurrentAlbum(prev => ({ ...prev, groups }));
    }
  };

  const deleteAlbum = (albumId) => {
    if (confirm('Are you sure you want to delete this album? This action cannot be undone.')) {
      const updatedAlbums = albums.filter(album => album.id !== albumId);
      setAlbums(updatedAlbums);
    }
  };

  if (currentView === 'create-wizard') {
    return (
      <CreateAlbumWizard 
        onComplete={handleWizardComplete}
        onCancel={handleWizardCancel}
      />
    );
  }

  if (currentView === 'upload') {
    return (
      <GuestUploadPage 
        albumName={currentAlbum.name}
        album={currentAlbum}
        onBack={() => openGallery(currentAlbum)}
      />
    );
  }

  if (currentView === 'gallery' || currentView === 'moderator') {
    return (
      <GalleryPage 
        albumName={currentAlbum.name}
        onBack={currentView === 'moderator' ? () => openGallery(currentAlbum) : backToDashboard}
        isModerator={currentView === 'moderator'}
      />
    );
  }

  if (currentView === 'groups') {
    return (
      <GroupManagementPage
        album={currentAlbum}
        onBack={backToDashboard}
        onUpdateGroups={(groups) => updateAlbumGroups(currentAlbum.id, groups)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Event Gallery Upload</h1>

        {/* Navigation Tabs */}
        <Tabs defaultValue="albums" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="albums">My Albums</TabsTrigger>
            <TabsTrigger value="storage">Storage</TabsTrigger>
            <TabsTrigger value="faq">FAQs</TabsTrigger>
          </TabsList>

          {/* My Albums Tab */}
          <TabsContent value="albums">
            <div className="space-y-6">
              {/* Create New Album Section */}
              <Card className="bg-white border-gray-200">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Album</h2>
                  <div className="flex gap-3">
                    <Input 
                      placeholder="Event Name (e.g., John & Emma's Wedding)" 
                      className="flex-1 bg-white text-gray-900 border-gray-300"
                      value={newAlbumName}
                      onChange={(e) => setNewAlbumName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && startCreateWizard()}
                    />
                    <Button onClick={startCreateWizard} className="bg-gray-900 text-white hover:bg-gray-800">Create</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Existing Albums */}
              {albums.map((album) => (
                <Card key={album.id} className="bg-white border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{album.name}</h3>
                        <p className="text-sm text-gray-500">{album.date}</p>
                        <p className="text-xs text-gray-400 mt-1">{album.groups?.length || 0} groups</p>
                        {album.googleAccount && (
                          <p className="text-xs text-green-600 mt-1">
                            Connected to: {album.googleAccount.email}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => generateQRCode(album)}
                          className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          <QrCodeIcon className="mr-2 h-4 w-4" />
                          QR Code
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => shareLink(album)}
                          className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          <Share2Icon className="mr-2 h-4 w-4" />
                          Share Link
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openGallery(album)}
                          className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          <EyeIcon className="mr-2 h-4 w-4" />
                          View Gallery
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openGroupManagement(album)}
                          className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          <PlusIcon className="mr-2 h-4 w-4" />
                          Manage Groups
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openGallery(album, true)}
                          className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                        >
                          <TrashIcon className="mr-2 h-4 w-4" />
                          Delete from gallery
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => openUploadPage(album)}
                          className="bg-gray-900 text-white hover:bg-gray-800"
                        >
                          <UploadCloudIcon className="mr-2 h-4 w-4" />
                          Upload
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Storage Tab */}
          <TabsContent value="storage">
            <Card className="bg-white border-gray-200">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Storage Usage</h2>
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">
                    Storage is managed through your connected Google Drive accounts.
                  </p>
                  <p className="text-sm text-gray-600">
                    Each album uses the Google Drive storage of the account that created it.
                    Check your Google Drive storage at{" "}
                    <a 
                      href="https://one.google.com/storage" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      Google One
                    </a>
                    .
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FAQs Tab */}
          <TabsContent value="faq">
            <Card className="bg-white border-gray-200">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Is it free for guests to upload?</h4>
                    <p className="text-sm text-gray-600">Yes, guests do not need an account to upload content.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">How do I share my album?</h4>
                    <p className="text-sm text-gray-600">Each album has a shareable URL and QR code for easy distribution via social, email, or print.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Where do the files go?</h4>
                    <p className="text-sm text-gray-600">All uploads go directly to your Google Drive album folder. You remain in full control of your data.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Are there upload limits?</h4>
                    <p className="text-sm text-gray-600">Uploads are only limited by your available Google Drive space (default is 15 GB).</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Can I create multiple albums?</h4>
                    <p className="text-sm text-gray-600">Absolutely. Use the dashboard to manage albums for different events separately.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">How does Google Drive integration work?</h4>
                    <p className="text-sm text-gray-600">When you create an album, we create organized folders in your Google Drive. All guest uploads are automatically sorted into the appropriate group folders.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* QR Code Dialog */}
        <Dialog open={showQrDialog} onOpenChange={setShowQrDialog}>
          <DialogContent className="max-w-md bg-white">
            <DialogHeader>
              <DialogTitle className="text-gray-900">QR Code for {selectedAlbum?.name}</DialogTitle>
              <DialogDescription className="text-gray-600">
                Guests can scan this QR code to access the upload page
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center space-y-4">
              {qrCodeUrl && (
                <img src={qrCodeUrl} alt="QR Code" className="border rounded-lg" />
              )}
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Or share this link:</p>
                <div className="flex items-center gap-2 p-2 bg-gray-100 rounded">
                  <code className="text-sm flex-1 truncate text-gray-900">{selectedAlbum?.shareUrl}</code>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyToClipboard(selectedAlbum?.shareUrl)}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <CopyIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Share Link Dialog */}
        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogContent className="max-w-md bg-white">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Share {selectedAlbum?.name}</DialogTitle>
              <DialogDescription className="text-gray-600">
                Share this link with your guests so they can upload photos and videos
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-gray-100 rounded">
                <code className="text-sm flex-1 truncate text-gray-900">{selectedAlbum?.shareUrl}</code>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => copyToClipboard(selectedAlbum?.shareUrl)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <CopyIcon className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button 
                  className="flex-1 bg-gray-900 text-white hover:bg-gray-800"
                  onClick={() => window.open(`mailto:?subject=Upload photos to ${selectedAlbum?.name}&body=Hi! Please upload your photos and videos to our album: ${selectedAlbum?.shareUrl}`, '_blank')}
                >
                  Share via Email
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.open(selectedAlbum?.shareUrl, '_blank')}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <ExternalLinkIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}