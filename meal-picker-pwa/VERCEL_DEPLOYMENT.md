# Vercel Deployment Guide

This guide explains how to deploy the Gimme Food PWA to Vercel with serverless functions.

## Prerequisites

- A Vercel account (sign up at [vercel.com](https://vercel.com))
- A Gemini API key from Google AI Studio
- Git repository connected to your Vercel account

## Quick Start

### 1. Connect Your Repository to Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your Git repository
4. Vercel will auto-detect the framework settings

### 2. Configure Build Settings

Vercel should automatically detect the following from `vercel.json`:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

If not auto-detected, you can manually set these in the project settings.

### 3. Set Environment Variables

**Critical Step**: You must configure the Gemini API key as an environment variable.

1. In your Vercel project dashboard, go to **Settings** → **Environment Variables**
2. Add the following variable:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: Your Gemini API key (get from [Google AI Studio](https://aistudio.google.com/app/apikey))
   - **Environments**: Select all (Production, Preview, Development)
3. Click **"Save"**

### 4. Deploy

1. Click **"Deploy"** in Vercel
2. Wait for the build to complete
3. Your app will be live at `https://your-project.vercel.app`

## Serverless Functions

The app includes two serverless functions that run on Vercel:

### `/api/analyze-nutrition`
- Analyzes food descriptions using Gemini AI
- Returns estimated nutrition data (calories, protein, carbs, fat)
- Called when users input what they ate

### `/api/generate-nutrition-goal`
- Generates personalized nutrition goals based on user stats
- Uses Gemini AI to calculate recommendations
- Called when users set up their nutrition targets

## Platform Detection

The app automatically detects whether it's running on Netlify or Vercel and uses the correct API endpoints:

- **Netlify**: `/.netlify/functions/[function-name]`
- **Vercel**: `/api/[function-name]`

This is handled by `src/utils/apiEndpoints.js`.

## Testing Your Deployment

After deployment, test the following features:

1. **Nutrition Analysis**:
   - Select a restaurant
   - Choose a meal
   - Input food description
   - Verify nutrition data is returned

2. **Nutrition Goal Setup**:
   - Go to nutrition goals
   - Try both AI mode and manual mode
   - Verify AI-generated goals work correctly

## Troubleshooting

### Issue: "API配置错误" Error

**Cause**: `GEMINI_API_KEY` environment variable is not set or invalid.

**Solution**:
1. Check that the environment variable is set in Vercel Dashboard
2. Verify your API key is valid in [Google AI Studio](https://aistudio.google.com/app/apikey)
3. Redeploy after adding/updating the environment variable

### Issue: Functions Timeout

**Cause**: Gemini API is slow or unreachable.

**Solution**:
- Vercel has a 10-second timeout for Hobby plan, 60 seconds for Pro
- Check Gemini API status
- Consider upgrading to Vercel Pro if needed

### Issue: CORS Errors

**Cause**: CORS headers not properly configured.

**Solution**:
- The functions already include CORS headers
- Check browser console for specific CORS errors
- Verify `vercel.json` has the correct CORS configuration

## Development vs Production

### Local Development
- Use `npm run dev` to run locally
- Can test with Netlify CLI (`netlify dev`) or Vercel CLI (`vercel dev`)
- Set `GEMINI_API_KEY` in `.env` file (don't commit this!)

### Production
- Environment variables managed in Vercel Dashboard
- Automatic deployments on git push (if configured)
- Preview deployments for pull requests

## Monitoring and Logs

View function logs in Vercel:
1. Go to your project dashboard
2. Click on a deployment
3. Navigate to **"Functions"** tab
4. Click on a function to see execution logs

## Cost Considerations

### Vercel
- **Hobby Plan** (Free): 100GB bandwidth, 100GB-hours function execution
- **Pro Plan** ($20/month): More bandwidth and longer execution times

### Gemini API
- Check current pricing at [Google AI Pricing](https://ai.google.dev/pricing)
- gemini-2.5-flash is optimized for cost-efficiency

## Dual Deployment (Netlify + Vercel)

This app supports **both** Netlify and Vercel simultaneously:

- Netlify functions in `netlify/functions/`
- Vercel functions in `api/`
- Frontend automatically detects platform via URL
- Both use the same `GEMINI_API_KEY` environment variable

You can deploy to both platforms and use whichever has available credits!

## Next Steps

- Set up custom domain in Vercel settings
- Enable automatic Git deployments
- Configure preview deployments for branches
- Set up Vercel Analytics (optional)

## Support

For issues specific to:
- **Vercel**: [Vercel Documentation](https://vercel.com/docs)
- **Gemini API**: [Google AI Documentation](https://ai.google.dev/docs)
- **This App**: Check the main README.md or open an issue
