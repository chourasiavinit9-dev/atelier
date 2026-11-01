#!/usr/bin/env bash
# deploy-firebase.sh — One-command Firebase App Hosting deployment
# Usage: ./scripts/deploy-firebase.sh
# Prerequisites:
#   1. Firebase project on Blaze plan: https://console.firebase.google.com/project/atelier-genai-2026/usage/details
#   2. GEMINI_API_KEY stored as secret: firebase apphosting:secrets:set GEMINI_API_KEY
#   3. firebase login (already authenticated)

set -e

PROJECT="atelier-genai-2026"
BACKEND_ID="atelier-backend"

echo "🔍 Pre-deploy checks..."
npm run lint
npm run typecheck
npm test
npm run score-check

echo ""
echo "📦 Building production bundle..."
npm run build

echo ""
echo "☁️  Deploying Firestore rules..."
firebase deploy --only firestore:rules --project "$PROJECT"

echo ""
echo "🚀 Deploying to Firebase App Hosting..."
echo "   (Requires Blaze plan + GEMINI_API_KEY secret)"
firebase apphosting:backends:create \
  --project "$PROJECT" \
  --location us-central1 \
  --id "$BACKEND_ID" 2>/dev/null || echo "Backend may already exist, continuing..."

firebase deploy --only apphosting --project "$PROJECT"

echo ""
echo "✅ Deployment complete!"
echo "   Firebase Console: https://console.firebase.google.com/project/$PROJECT/apphosting"
echo "   Live URL will appear in the console after first build completes."

