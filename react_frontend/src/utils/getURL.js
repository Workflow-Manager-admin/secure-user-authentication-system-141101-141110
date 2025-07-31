/**
 * PUBLIC_INTERFACE
 * Utility function to get the site URL from environment variables
 * Allows easy switching between development and production environments
 */

/**
 * Get the current site URL based on environment variables
 * @returns {string} The formatted site URL with trailing slash
 */
export const getURL = () => {
  let url = process.env.REACT_APP_SITE_URL ||
    process.env.REACT_APP_VERCEL_URL ||
    'https://project-2025-07-30-084829-2.kavia.app' ||
    'http://localhost:3000'

  // Ensure URL starts with http/https
  if (!url.startsWith('http')) {
    url = `https://${url}`
  }

  // Ensure URL ends with /
  if (!url.endsWith('/')) {
    url = `${url}/`
  }

  return url
}

export default getURL
