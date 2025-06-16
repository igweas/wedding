// Google API configuration - loaded from environment variables
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email';

let isInitialized = false;
let currentUser = null;
let tokenClient = null;

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
    
    // Wait for both gapi and google to be available
    await new Promise((resolve) => {
      const checkReady = () => {
        if (window.gapi && window.google) {
          resolve();
        } else {
          setTimeout(checkReady, 100);
        }
      };
      checkReady();
    });
    
    // Initialize GAPI client for Drive API only
    await new Promise((resolve, reject) => {
      window.gapi.load('client', async () => {
        try {
          await window.gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: [DISCOVERY_DOC]
          });
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
    
    // Initialize Google Identity Services token client
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (response) => {
        if (response.error) {
          console.error('Token client error:', response.error);
          return;
        }
        // Token received successfully
        currentUser = {
          ...currentUser,
          accessToken: response.access_token
        };
      }
    });
    
    isInitialized = true;
  } catch (error) {
    console.error('Error initializing Google API:', error);
    throw error;
  }
};

export const signInWithGoogle = async () => {
  try {
    await initializeGapi();
    
    if (!tokenClient) {
      throw new Error('Google Auth not initialized properly');
    }
    
    // Request access token
    return new Promise((resolve, reject) => {
      tokenClient.callback = async (response) => {
        if (response.error) {
          if (response.error === 'popup_closed_by_user') {
            reject(new Error('Sign-in was cancelled. Please try again.'));
          } else if (response.error === 'invalid_client') {
            reject(new Error('Google API credentials are not properly configured. Please check your .env file and Google Cloud Console setup.'));
          } else if (response.error === 'access_denied') {
            reject(new Error('Access denied. This may be due to domain verification requirements. Please contact the developer to add your domain to the authorized origins.'));
          } else {
            reject(new Error(`Authentication error: ${response.error}`));
          }
          return;
        }
        
        try {
          // Get user info using the access token
          const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
              'Authorization': `Bearer ${response.access_token}`
            }
          });
          
          if (!userInfoResponse.ok) {
            throw new Error('Failed to fetch user information');
          }
          
          const userInfo = await userInfoResponse.json();
          
          currentUser = {
            id: userInfo.id,
            name: userInfo.name,
            email: userInfo.email,
            imageUrl: userInfo.picture,
            accessToken: response.access_token
          };
          
          resolve(currentUser);
        } catch (error) {
          reject(error);
        }
      };
      
      tokenClient.requestAccessToken({ prompt: 'consent' });
    });
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const signOutFromGoogle = async () => {
  try {
    if (currentUser && currentUser.accessToken) {
      window.google.accounts.oauth2.revoke(currentUser.accessToken);
    }
    currentUser = null;
  } catch (error) {
    console.error('Error signing out from Google:', error);
    throw error;
  }
};

export const isSignedIn = () => {
  return currentUser !== null && currentUser.accessToken !== undefined;
};

export const getCurrentUser = () => {
  return currentUser;
};

export const createDriveFolder = async (folderName, parentFolderId = null) => {
  try {
    const fileMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentFolderId ? [parentFolderId] : undefined
    };

    const response = await window.gapi.client.drive.files.create({
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
    const response = await window.gapi.client.drive.files.list({
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
    await window.gapi.client.drive.files.delete({
      fileId: fileId
    });
    return true;
  } catch (error) {
    console.error('Error deleting file from Drive:', error);
    throw error;
  }
};