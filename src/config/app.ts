/**
 * Application Configuration
 *
 * Centralized configuration for app branding and naming.
 * To change the app name, update the NEXT_PUBLIC_APP_NAME environment variable in .env
 */

export const appConfig = {
  /**
   * The display name of the application (title case)
   * Used in: page titles, navbar, admin header, etc.
   */
  name: process.env.NEXT_PUBLIC_APP_NAME || "DejaVu",

  /**
   * Get the app name in lowercase
   * Used in: splash screens, logos with specific styling
   */
  get nameLowercase() {
    return this.name.toLowerCase();
  },

  /**
   * Get the app name for admin sections
   * Appends "Admin" to the app name
   */
  get adminName() {
    return `${this.name} Admin`;
  },

  /**
   * App description (can be customized via env var if needed)
   */
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || "Event management and ticketing platform",

  /**
   * Organization/Creator name
   */
  creator: "TERRA",
};
