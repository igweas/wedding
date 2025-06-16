import { gapi } from 'gapi-script';

// Google API configuration - loaded from environment variables
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email';

let isInitialized = false;

export const initializeGapi = async () => {
  if (isInitialized) return;
  
  try {
    // Check if environment variables are set
    if (!CLIENT_ID || !API_KEY) {
      throw new Error('Google API credentials not found. Please check your .env file and ensure VITE_GOOGLE_CLIENT_ID and VITE_GOOGLE_API_KEY are set.');
    }
    
    // Check if credentials are still placeholder values
    if (CLIENT_ID.includes('VITE_GOOGLE_CLIENT_ID') || API_KEY.includes('VITE_GOOGLE_API_KEY')) {
      throw new Error('Google API credentials not configured. Please update VITE_GOOGLE_CLIENT_ID and VITE_GOOGLE_API_KEY in your .env file with your actual credentials.');
    }
    
    await new Promise((resolve, reject) => {
      gapi.load('client:auth2', async () => {
        try {
          await gapi.client.init({
            apiKey: API_KEY,
            clientId: CLIENT_ID,
            discoveryDocs: [DISCOVERY_DOC],
            scope: SCOPES
          });
          isInitialized = true;
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Error initializing Google API:', error);
    throw error;
  }
};

export const signInWithGoogle = async () => {
  try {
    await initializeGapi();
    const authInstance = gapi.auth2.getAuthInstance();
    
    if (!authInstance) {
      throw new Error('Google Auth not initialized properly');
    }
    
    const user = await authInstance.signIn();
    
    const profile = user.getBasicProfile();
    return {
      id: profile.getId(),
      name: profile.getName(),
      email: profile.getEmail(),
      imageUrl: profile.getImageUrl(),
      accessToken: user.getAuthResponse().access_token
    };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    if (error.error === 'popup_closed_by_user') {
      throw new Error('Sign-in was cancelled. Please try again.');
    } else if (error.error === 'invalid_client') {
      throw new Error('Google API credentials are not properly configured. Please check your .env file and Google Cloud Console setup.');
    }
    throw error;
  }
};

export const signOutFromGoogle = async () => {
  try {
    const authInstance = gapi.auth2.getAuthInstance();
    if (authInstance) {
      await authInstance.signOut();
    }
  } catch (error) {
    console.error('Error signing out from Google:', error);
    throw error;
  }
};

export const isSignedIn = () => {
  try {
    const authInstance = gapi.auth2.getAuthInstance();
    return authInstance && authInstance.isSignedIn.get();
  } catch (error) {
    return false;
  }
};

export const getCurrentUser = () => {
  try {
    const authInstance = gapi.auth2.getAuthInstance();
    if (authInstance && authInstance.isSignedIn.get()) {
      const user = authInstance.currentUser.get();
      const profile = user.getBasicProfile();
      return {
        id: profile.getId(),
        name: profile.getName(),
        email: profile.getEmail(),
        imageUrl: profile.getImageUrl(),
        accessToken: user.getAuthResponse().access_token
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const createDriveFolder = async (folderName, parentFolderId = null) => {
  try {
    const fileMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentFolderId ? [parentFolderId] : undefined
    };

    const response = await gapi.client.drive.files.create({
      resource: fileMetadata,
      fields: 'id,name'
    });

    return response.result;
  } catch (error) {
    console.error('Error creating Drive folder:', error);
    throw error;
  }
};

export const createEventFolderStructure = async (eventName, groups) => {
  try {
    // Create main event folder
    const mainFolder = await createDriveFolder(`Event Gallery - ${eventName}`);
    
    // Create subfolders for each group
    const groupFolders = [];
    for (const group of groups) {
      const groupFolder = await createDriveFolder(group.name, mainFolder.id);
      groupFolders.push({
        ...group,
        folderId: groupFolder.id
      });
    }

    return {
      mainFolderId: mainFolder.id,
      mainFolderName: mainFolder.name,
      groupFolders
    };
  } catch (error) {
    console.error('Error creating event folder structure:', error);
    throw error;
  }
};

export const uploadFileToDrive = async (file, folderId, fileName = null) => {
  try {
    const user = getCurrentUser();
    if (!user || !user.accessToken) {
      throw new Error('User not authenticated');
    }

    const fileMetadata = {
      name: fileName || file.name,
      parents: [folderId]
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(fileMetadata)], {type: 'application/json'}));
    form.append('file', file);

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
      method: 'POST',
      headers: new Headers({
        'Authorization': `Bearer ${user.accessToken}`
      }),
      body: form
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.statusText} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading file to Drive:', error);
    throw error;
  }
};

export const listFilesInFolder = async (folderId) => {
  try {
    const response = await gapi.client.drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id,name,mimeType,createdTime,webViewLink,thumbnailLink)'
    });

    return response.result.files || [];
  } catch (error) {
    console.error('Error listing files in folder:', error);
    throw error;
  }
};

export const deleteFileFromDrive = async (fileId) => {
  try {
    await gapi.client.drive.files.delete({
      fileId: fileId
    });
    return true;
  } catch (error) {
    console.error('Error deleting file from Drive:', error);
    throw error;
  }
};