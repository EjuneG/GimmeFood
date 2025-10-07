// API Endpoint Detection Utility
// Automatically detects whether the app is running on Netlify or Vercel
// and returns the correct API endpoint path

/**
 * Detects the deployment platform based on environment or URL
 * @returns {'netlify' | 'vercel' | 'local'}
 */
export function detectPlatform() {
  // Check if running in browser
  if (typeof window === 'undefined') {
    return 'local';
  }

  const hostname = window.location.hostname;

  // Detect Vercel
  if (hostname.includes('vercel.app') || hostname.includes('vercel.com')) {
    return 'vercel';
  }

  // Detect Netlify
  if (hostname.includes('netlify.app') || hostname.includes('netlify.com')) {
    return 'netlify';
  }

  // Check for custom domains by attempting to detect environment-specific patterns
  // Vercel typically sets a specific header or has specific behavior
  // For custom domains, you may need to set an environment variable during build

  // Fallback: Check if Netlify functions exist by convention
  // Default to Netlify for local development if using Netlify CLI
  return 'netlify';
}

/**
 * Gets the correct API base path for the current platform
 * @returns {string} The API base path (e.g., '/.netlify/functions' or '/api')
 */
export function getApiBasePath() {
  const platform = detectPlatform();

  switch (platform) {
    case 'vercel':
      return '/api';
    case 'netlify':
    default:
      return '/.netlify/functions';
  }
}

/**
 * Gets the full API endpoint URL for a specific function
 * @param {string} functionName - The name of the serverless function
 * @returns {string} The complete endpoint URL
 */
export function getApiEndpoint(functionName) {
  const basePath = getApiBasePath();
  return `${basePath}/${functionName}`;
}

/**
 * Makes a POST request to a serverless function with automatic platform detection
 * @param {string} functionName - The name of the serverless function
 * @param {object} data - The data to send in the request body
 * @returns {Promise<Response>} The fetch response
 */
export async function callServerlessFunction(functionName, data) {
  const endpoint = getApiEndpoint(functionName);

  return fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}
