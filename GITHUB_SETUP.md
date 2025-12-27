# GitHub Setup Guide

## Quick Setup

### Option 1: Create Repository on GitHub (Recommended)

1. **Go to GitHub** and create a new repository:
   - Visit: https://github.com/new
   - Repository name: `flippin` (or your preferred name)
   - Description: "South African second-hand marketplace with AI-powered analysis"
   - Visibility: Private (recommended for now)
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)

2. **Connect your local repository:**

```bash
cd "/Users/Focus/Library/Mobile Documents/com~apple~CloudDocs/Business/Flippin/Code/flippin"

# Add the remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/flippin.git

# Or if you prefer SSH:
git remote add origin git@github.com:YOUR_USERNAME/flippin.git

# Push your code
git branch -M main
git push -u origin main
```

### Option 2: Use GitHub CLI (if installed)

```bash
cd "/Users/Focus/Library/Mobile Documents/com~apple~CloudDocs/Business/Flippin/Code/flippin"

# Create repository and push in one command
gh repo create flippin --private --source=. --remote=origin --push
```

## Initial Commit

Before pushing, make sure you've committed your files:

```bash
# Stage all files (except .env which is ignored)
git add .

# Create initial commit
git commit -m "Initial commit: Flippin marketplace platform

- Next.js 16 with TypeScript
- AI-powered vision analysis and pricing
- Supabase integration
- Cloudflare R2 for images
- Complete seller flow UI
- Prisma database schema"

# Push to GitHub
git push -u origin main
```

## Environment Variables on GitHub

**Important:** Never commit your `.env` file! It's already in `.gitignore`.

For deployment (Vercel, etc.), you'll need to add environment variables in the platform's dashboard:

1. Go to your deployment platform (Vercel, etc.)
2. Navigate to project settings → Environment Variables
3. Add all variables from your `.env` file
4. Make sure to set different values for production if needed

## Deployment with Vercel

Once GitHub is set up:

1. **Connect to Vercel:**
   - Go to https://vercel.com
   - Sign in with GitHub
   - Click "Add New Project"
   - Select your `flippin` repository

2. **Configure:**
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

3. **Add Environment Variables:**
   - Copy all variables from your `.env` file
   - Add them in Vercel dashboard
   - Set for: Production, Preview, Development

4. **Deploy:**
   - Click "Deploy"
   - Vercel will automatically deploy on every push to `main`
   - Preview deployments for pull requests

## Branch Strategy (Recommended)

```bash
# Main branch for production
git checkout -b main

# Feature branches
git checkout -b feature/seller-flow
git checkout -b feature/marketplace
git checkout -b feature/authentication

# After completing a feature:
git checkout main
git merge feature/seller-flow
git push origin main
```

## Daily Workflow

```bash
# Start working on a feature
git checkout -b feature/my-feature

# Make changes, then commit
git add .
git commit -m "Add feature description"

# Push to GitHub
git push origin feature/my-feature

# Create Pull Request on GitHub
# After review, merge to main
```

## Troubleshooting

### If you get "repository not found":
- Check that you've created the repository on GitHub
- Verify the repository name matches
- Check your GitHub authentication

### If you get authentication errors:
```bash
# For HTTPS, you may need a Personal Access Token
# Generate one at: https://github.com/settings/tokens

# Or switch to SSH
git remote set-url origin git@github.com:YOUR_USERNAME/flippin.git
```

### If .env file is being tracked:
```bash
# Remove it from git (but keep the file)
git rm --cached .env
git commit -m "Remove .env from tracking"
```

## Next Steps After GitHub Setup

1. ✅ Repository created and connected
2. ✅ Code pushed to GitHub
3. ⏭️ Connect to Vercel for deployment
4. ⏭️ Set up environment variables in Vercel
5. ⏭️ Configure automatic deployments
6. ⏭️ Set up branch protection rules (optional)

---

**Need help?** Check the main `PROJECT_ANALYSIS.md` for more details.

