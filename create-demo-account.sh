#!/bin/bash

# Create demo Firebase user using Firebase Authentication API
echo "🔐 Creating demo account in Firebase..."

FIREBASE_PROJECT="vitecredit"
FIREBASE_API_KEY="AIzaSyDoAcnS8SzSolOpiQ5GsB0oCibsHzW9KHM"

DEMO_EMAIL="demo@vitecredit.com"
DEMO_PASSWORD="Demo123!@#"

# Use Firebase REST API to create user
curl -X POST "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${DEMO_EMAIL}\",
    \"password\": \"${DEMO_PASSWORD}\",
    \"returnSecureToken\": true
  }" > /tmp/user_response.json

echo ""
echo "✅ Demo account created!"
echo ""
echo "📋 Demo Credentials:"
echo "Email: ${DEMO_EMAIL}"
echo "Password: ${DEMO_PASSWORD}"
echo ""
echo "🔗 Open: https://vitecredit.web.app"
echo "👉 Click 'Sign In' and use above credentials"
