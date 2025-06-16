import React, { useState } from "react";
import { Card, CardContent } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/tabs";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./components/ui/dialog";
import { QrCodeIcon, Share2Icon, UploadCloudIcon, ExternalLinkIcon, CopyIcon, EyeIcon } from "lucide-react";
import QRCode from 'qrcode';
import GuestUploadPage from './components/GuestUploadPage';
import GalleryPage from './components/GalleryPage';

export default function EventAlbumApp() {
  const [albums, setAlbums] = useState([
    { id: 1, name: "John & Emma's Wedding", date: "10th June 2025", shareUrl: "https://weduploader.com/album/john-emma-wedding" }
  ]);
  const [newAlbumName, setNewAlbumName] = useState("");
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [showQrDialog, setShowQrDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'upload', 'gallery', 'moderator'
  const [currentAlbum, setCurrentAlbum] = useState(null);

  const createAlbum = () => {
    if (newAlbumName.trim()) {
      const newAlbum = {
        id: Date.now(),
        name: newAlbumName,
        date: new Date().toLocaleDateString('en-GB', { 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        }),
        shareUrl: `https://weduploader.com/album/${newAlbumName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
      };
      setAlbums([...albums, newAlbum]);
      setNewAlbumName("");
    }
  };

  const generateQRCode = async (album) => {
    try {
      const qrDataUrl = await QRCode.toDataURL(album.shareUrl, {
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

  const backToDashboard = () => {
    setCurrentView('dashboard');
    setCurrentAlbum(null);
  };

  if (currentView === 'upload') {
    return (
      <GuestUploadPage 
        albumName={currentAlbum.name}
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Event Album Uploader</h1>

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
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Album</h2>
                  <div className="flex gap-3">
                    <Input 
                      placeholder="Event Name (e.g., John & Emma's Wedding)" 
                      className="flex-1"
                      value={newAlbumName}
                      onChange={(e) => setNewAlbumName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && createAlbum()}
                    />
                    <Button onClick={createAlbum}>Create</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Existing Albums */}
              {albums.map((album) => (
                <Card key={album.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{album.name}</h3>
                        <p className="text-sm text-gray-500">{album.date}</p>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => generateQRCode(album)}
                        >
                          <QrCodeIcon className="mr-2 h-4 w-4" />
                          QR Code
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => shareLink(album)}
                        >
                          <Share2Icon className="mr-2 h-4 w-4" />
                          Share Link
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openGallery(album)}
                        >
                          <EyeIcon className="mr-2 h-4 w-4" />
                          View Gallery
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openGallery(album, true)}
                          className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                        >
                          Moderate
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => openUploadPage(album)}
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
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Storage Usage</h2>
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">
                    Currently using <span className="font-semibold">13.2 GB</span> of 15 GB.
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '88%' }}></div>
                  </div>
                  <p className="text-sm text-red-600">
                    You are nearing your storage limit.{" "}
                    <a 
                      href="https://one.google.com/storage" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      Upgrade here
                    </a>
                    .
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FAQs Tab */}
          <TabsContent value="faq">
            <Card>
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* QR Code Dialog */}
        <Dialog open={showQrDialog} onOpenChange={setShowQrDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>QR Code for {selectedAlbum?.name}</DialogTitle>
              <DialogDescription>
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
                  <code className="text-sm flex-1 truncate">{selectedAlbum?.shareUrl}</code>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyToClipboard(selectedAlbum?.shareUrl)}
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
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Share {selectedAlbum?.name}</DialogTitle>
              <DialogDescription>
                Share this link with your guests so they can upload photos and videos
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-gray-100 rounded">
                <code className="text-sm flex-1 truncate">{selectedAlbum?.shareUrl}</code>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => copyToClipboard(selectedAlbum?.shareUrl)}
                >
                  <CopyIcon className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button 
                  className="flex-1"
                  onClick={() => window.open(`mailto:?subject=Upload photos to ${selectedAlbum?.name}&body=Hi! Please upload your photos and videos to our album: ${selectedAlbum?.shareUrl}`, '_blank')}
                >
                  Share via Email
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.open(selectedAlbum?.shareUrl, '_blank')}
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