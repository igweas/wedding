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

### Google API Configuration (REQUIRED)

To enable Google Drive integration, you **MUST** set up Google API credentials:

#### Step 1: Create Google Cloud Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Google Drive API
   - Google+ API (for user info)

#### Step 2: Create OAuth 2.0 Credentials
1. Go to "Credentials" in the Google Cloud Console
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Configure the OAuth consent screen if prompted
4. For Application type, select "Web application"
5. Add authorized JavaScript origins:
   - `http://localhost:5173` (for development)
   - Your production domain (when deployed)
6. Copy the Client ID

#### Step 3: Create API Key
1. In "Credentials", click "Create Credentials" → "API Key"
2. Restrict the API key to Google Drive API for security
3. Copy the API Key

#### Step 4: Update Configuration
Edit `src/utils/googleApi.js` and replace the placeholder values:

```javascript
const CLIENT_ID = 'your-actual-client-id.apps.googleusercontent.com';
const API_KEY = 'your-actual-api-key';
```

**⚠️ IMPORTANT**: The application will not work until you replace these placeholder values with your actual Google API credentials.

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

## Troubleshooting

### Error 401: invalid_client
This error occurs when Google API credentials are not properly configured. Make sure you:
1. Have valid CLIENT_ID and API_KEY in `src/utils/googleApi.js`
2. Added your domain to authorized origins in Google Cloud Console
3. Enabled the required APIs (Google Drive API, Google+ API)

### Upload Failures
- Check that the user is properly authenticated
- Verify Google Drive API permissions
- Ensure the folder structure was created successfully

## Development

The app uses localStorage for album management and Google Drive for file storage. In production, consider implementing a backend for better data persistence and user management.

## Production Deployment

When deploying to production:
1. Update the authorized JavaScript origins in Google Cloud Console
2. Replace localhost URLs with your production domain
3. Consider implementing additional security measures
4. Test the Google API integration thoroughly