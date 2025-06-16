# Event Gallery Upload

A React application for creating and managing event photo galleries with Google Drive integration.

## Features

- **Create Event Albums**: Multi-step wizard to create albums with custom groups
- **Google Drive Integration**: Automatic folder creation and file organization
- **Guest Upload**: Allow guests to upload photos/videos without accounts
- **Group Management**: Organize uploads into custom categories
- **QR Code Sharing**: Easy sharing via QR codes and links
- **Real-time Upload**: Direct upload to Google Drive with progress tracking

## Setup

### Google API Configuration

To enable Google Drive integration, you need to:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Drive API and Google+ API
4. Create credentials (OAuth 2.0 Client ID)
5. Add your domain to authorized origins
6. Update the configuration in `src/utils/googleApi.js`:

```javascript
const CLIENT_ID = 'your-google-client-id.apps.googleusercontent.com';
const API_KEY = 'your-google-api-key';
```

### Installation

```bash
npm install
npm run dev
```

## Usage

1. **Create Album**: Use the wizard to set up event details and Google Drive integration
2. **Manage Groups**: Organize your event into categories (ceremony, reception, etc.)
3. **Share**: Generate QR codes or share links with guests
4. **Upload**: Guests can upload directly to organized Google Drive folders
5. **View Gallery**: Browse uploaded content organized by groups

## Technologies

- React 19
- Tailwind CSS
- Google APIs (Drive, Auth)
- QR Code generation
- Vite build system

## File Structure

- `src/components/` - React components
- `src/utils/googleApi.js` - Google API integration
- `src/EventAlbumApp.jsx` - Main application component

## Security Notes

- All uploads go directly to the album creator's Google Drive
- Guests don't need accounts but uploads are organized automatically
- Album creators maintain full control over their data
- OAuth integration ensures secure authentication

## Development

The app uses localStorage for album management and Google Drive for file storage. In production, consider implementing a backend for better data persistence and user management.