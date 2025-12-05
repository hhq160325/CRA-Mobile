# Security Guidelines

## Environment Variables

### Development
1. Copy `.env.example` to `.env`
2. Fill in your actual API URLs and keys
3. **NEVER** commit `.env` to version control
4. The `.env` file is already in `.gitignore`

### Production
For production builds, environment variables should be:
1. Set through your CI/CD pipeline (GitHub Actions, GitLab CI, etc.)
2. Configured in your hosting platform (Vercel, Netlify, AWS, etc.)
3. **NEVER** hardcoded in the source code

## API Configuration

All API URLs are centralized in `lib/api/config.ts`:
- Uses environment variables when available
- Falls back to a default URL only for development
- All services import from this central config

## Best Practices

### ✅ DO:
- Use environment variables for all sensitive data
- Keep `.env` file local only
- Use `.env.example` to document required variables
- Configure production URLs through build/deployment tools
- Review code for hardcoded URLs before committing

### ❌ DON'T:
- Commit `.env` files to version control
- Hardcode API URLs in component files
- Share API keys or secrets in code
- Use production URLs in development code
- Expose sensitive data in client-side code

## Checking for Hardcoded URLs

Before committing, run:
```bash
# Search for hardcoded URLs
grep -r "selfdrivecarrentalservice" --exclude-dir=node_modules --exclude-dir=.git .
```

All API calls should use `API_CONFIG.BASE_URL` from `lib/api/config.ts`.

## React Native Specific

For React Native apps:
- Environment variables are bundled at build time
- Use `react-native-dotenv` or similar for env var support
- Sensitive keys should never be in the app bundle
- Use secure storage for tokens and user data

## Reporting Security Issues

If you find a security vulnerability, please report it privately to the development team.
