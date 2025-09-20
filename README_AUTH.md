# Authentication System

This project now includes a complete authentication system with email/password and Google OAuth support.

## 🚀 Features

### Email/Password Authentication
- User registration with secure password hashing
- Sign-in with email and password
- Form validation and error handling
- Automatic redirect to dashboard after authentication

### Google OAuth Authentication
- One-click sign-in with Google
- Secure OAuth 2.0 flow
- User profile information from Google

### Security Features
- Passwords hashed with bcryptjs (12 rounds)
- JWT-based sessions
- Middleware protection for authenticated routes
- CSRF protection via NextAuth.js

## 🔧 Setup

### 1. Database
The SQLite database is already configured and migrated. Tables include:
- `User` - User accounts
- `Account` - OAuth provider accounts
- `Session` - User sessions
- `VerificationToken` - Email verification tokens

### 2. Environment Variables
Update your `.env.local` file with:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth.js
NEXTAUTH_SECRET="hl/ioWkLNA4Q5Acuft0dTYl4OLuvJ2CDqFRmSfteHkM="
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (get these from Google Cloud Console)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 3. Google OAuth Setup
Follow the instructions in `GOOGLE_OAUTH_SETUP.md` to configure Google OAuth.

## 📱 Pages

### Authentication Pages
- `/auth/signin` - Sign in with email/password or Google
- `/auth/signup` - Create new account

### Protected Pages
- `/dashboard` - Main user dashboard (requires authentication)
- `/recording-studio` - Recording functionality (requires authentication)

## 🛡️ Route Protection

Protected routes are automatically redirected to sign-in if the user is not authenticated. This is handled by:
- Middleware (`middleware.ts`) for server-side protection
- Client-side session checks for UI updates

## 🔄 User Flow

1. **Landing Page**: Unauthenticated users see the hero page with sign-up prompts
2. **Registration**: Users can sign up with email/password or Google
3. **Authentication**: After sign-in, users are redirected to dashboard
4. **Session Management**: Authenticated users see their profile in the header
5. **Sign Out**: Users can sign out and return to the landing page

## 🧪 Testing

### Manual Testing
1. Visit `http://localhost:3000`
2. Click "Get Started" or "Start Recording"
3. Sign up with a test email
4. Verify redirect to dashboard
5. Test sign out functionality

### Test User Creation
You can create test users by:
1. Using the sign-up form at `/auth/signup`
2. Using Google OAuth (requires setup)

## 🔧 Development Notes

- Authentication state is managed by NextAuth.js
- Session provider wraps the entire app in `layout.tsx`
- User interface updates based on authentication status
- All sensitive routes are protected via middleware

## 🚨 Security Considerations

- Never commit real OAuth credentials to version control
- Use strong secrets in production
- Regularly rotate secrets and API keys
- Consider implementing email verification for production use 