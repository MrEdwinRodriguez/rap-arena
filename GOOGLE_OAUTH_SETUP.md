# Google OAuth Setup Instructions

To enable Google OAuth authentication, you need to set up a Google Cloud Project and configure OAuth 2.0 credentials.

## Steps:

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create or Select a Project**
   - Create a new project or select an existing one

3. **Enable Google+ API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it

4. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - For development: `http://localhost:3000/api/auth/callback/google`
     - For production: `https://yourdomain.com/api/auth/callback/google`

5. **Update Environment Variables**
   Add these variables to your `.env.local` file:
   ```
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

6. **Generate NextAuth Secret**
   Run this command to generate a secure secret:
   ```bash
   openssl rand -base64 32
   ```
   
   Add it to your `.env.local`:
   ```
   NEXTAUTH_SECRET="your-generated-secret"
   ```

## Notes:
- Replace `your-google-client-id` and `your-google-client-secret` with actual values from Google Cloud Console
- For production, make sure to update `NEXTAUTH_URL` to your actual domain
- Keep your credentials secure and never commit them to version control 