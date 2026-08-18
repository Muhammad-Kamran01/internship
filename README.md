<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/9a0b2231-48fd-4d5c-89eb-c4e048dbce0f

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

# Public Assets Directory

Place your popup images in this directory (`/public`):

1. **Student Welcome Popup Image**: `welcome-student.png` (or `welcome-student.jpg`)
   - Path: `/public/welcome-student.png`
   - Access URL in code: `/welcome-student.png`

2. **Assistant / Freelancer Welcome Popup Image**: `welcome-assistant.png` (or `welcome-assistant.jpg`)
   - Path: `/public/welcome-assistant.png`
   - Access URL in code: `/welcome-assistant.png`

When these image files are placed in this `/public` directory, the Student Assistant platform will automatically display them inside the login welcome popup dialog!