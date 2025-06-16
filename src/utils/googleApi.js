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
    
    // Initialize Google Identity Services token client with popup mode
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      ux_mode: 'popup'
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
    
    // Request access token using popup mode
    return new Promise((resolve, reject) => {
      let callbackExecuted = false;
      
      // Set up a timeout to detect popup blocking
      const timeoutId = setTimeout(() => {
        if (!callbackExecuted) {
          callbackExecuted = true;
          reject(new Error('popup_blocked'));
        }
      }, 500); // Reduced timeout for faster detection
      
      try {
        tokenClient.requestAccessToken({
          prompt: 'consent',
          callback: async (response) => {
            if (callbackExecuted) return;
            callbackExecuted = true;
            clearTimeout(timeoutId);
            
            if (response.error) {
              if (response.error === 'popup_closed_by_user') {
                reject(new Error('popup_closed_by_user'));
              } else if (response.error === 'invalid_client') {
                reject(new Error('Google API credentials are not properly configured. Please check your .env file and Google Cloud Console setup.'));
              } else if (response.error === 'access_denied') {
                reject(new Error('Access denied. This may be due to domain verification requirements. Please contact the developer to add your domain to the authorized origins.'));
              } else if (response.error === 'popup_blocked_by_browser') {
                reject(new Error('popup_blocked'));
              } else {
                // Check if this might be a popup blocking issue
                if (response.error.includes('popup') || response.error.includes('blocked')) {
                  reject(new Error('popup_blocked'));
                } else {
                  reject(new Error(`Authentication error: ${response.error}`));
                }
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
          },
          error_callback: (error) => {
            if (callbackExecuted) return;
            callbackExecuted = true;
            clearTimeout(timeoutId);
            
            // Handle GSI library errors that don't go through the main callback
            if (error.type === 'popup_failed_to_open' || 
                error.message?.includes('popup') || 
                error.message?.includes('Failed to open popup')) {
              reject(new Error('popup_blocked'));
            } else {
              reject(new Error(`Authentication error: ${error.message || error.type || 'Unknown error'}`));
            }
          }
        });
      } catch (error) {
        if (!callbackExecuted) {
          callbackExecuted = true;
          clearTimeout(timeoutId);
          
          // Check if the error is related to popup blocking
          if (error.message?.includes('Failed to open popup') || 
              error.message?.includes('popup') || 
              error.message?.includes('blocked')) {
            reject(new Error('popup_blocked'));
          } else {
            reject(error);
          }
        }
      }
    });
  } catch (error) {
    console.error('Error signing in with Google:', error);
    // Check if the error might be related to popup blocking
    if (error.message?.includes('Failed to open popup') || 
        error.message?.includes('popup') || 
        error.message?.includes('blocked')) {
      throw new Error('popup_blocked');
    }
    throw error;
  }
};

// Alternative sign-in method using redirect flow
export const signInWithGoogleRedirect = async () => {
  try {
    await initializeGapi();
    
    // Create a redirect-based token client
    const redirectTokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      ux_mode: 'redirect',
      redirect_uri: window.location.origin + window.location.pathname
    });
    
    // Store current state to restore after redirect
    sessionStorage.setItem('google_auth_redirect', 'true');
    sessionStorage.setItem('google_auth_return_url', window.location.href);
    
    // Request access token using redirect mode
    redirectTokenClient.requestAccessToken({
      prompt: 'consent'
    });
    
  } catch (error) {
    console.error('Error with redirect sign-in:', error);
    throw error;
  }
};

// Handle redirect callback
export const handleRedirectCallback = async () => {
  try {
    const urlParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = urlParams.get('access_token');
    const error = urlParams.get('error');
    
    if (error) {
      throw new Error(`Authentication error: ${error}`);
    }
    
    if (accessToken && sessionStorage.getItem('google_auth_redirect') === 'true') {
      // Clear redirect flag
      sessionStorage.removeItem('google_auth_redirect');
      
      // Get user info using the access token
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
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
        accessToken: accessToken
      };
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      return currentUser;
    }
    
    return null;
  } catch (error) {
    console.error('Error handling redirect callback:', error);
    sessionStorage.removeItem('google_auth_redirect');
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