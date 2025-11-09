#!/bin/bash
# Deployment script for Firebase Provisioning Backend to Cloud Run

set -e

echo "🚀 Firebase Provisioning Backend - Cloud Run Deployment"
echo "========================================================"

# Check if required tools are installed
command -v gcloud >/dev/null 2>&1 || { echo "❌ gcloud CLI is required but not installed. Aborting."; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ docker is required but not installed. Aborting."; exit 1; }

# Get project ID
if [ -z "$GCP_PROJECT_ID" ]; then
  echo "🔍 No GCP_PROJECT_ID environment variable found."
  read -p "Enter your GCP Project ID: " GCP_PROJECT_ID
fi

echo "📦 Project: $GCP_PROJECT_ID"

# Set the project
gcloud config set project "$GCP_PROJECT_ID"

# Enable required APIs
echo "🔧 Enabling required APIs..."
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  containerregistry.googleapis.com \
  firebase.googleapis.com \
  cloudresourcemanager.googleapis.com \
  serviceusage.googleapis.com

# Create service account if it doesn't exist
SA_NAME="firebase-provisioning-sa"
SA_EMAIL="${SA_NAME}@${GCP_PROJECT_ID}.iam.gserviceaccount.com"

if gcloud iam service-accounts describe "$SA_EMAIL" >/dev/null 2>&1; then
  echo "✅ Service account already exists: $SA_EMAIL"
else
  echo "👤 Creating service account: $SA_EMAIL"
  gcloud iam service-accounts create "$SA_NAME" \
    --display-name="Firebase Provisioning Service Account" \
    --description="Service account for automatic Firebase project provisioning"
fi

# Grant necessary roles
echo "🔐 Granting IAM roles..."
ROLES=(
  "roles/firebase.admin"
  "roles/resourcemanager.projectCreator"
  "roles/serviceusage.serviceUsageAdmin"
  "roles/iam.serviceAccountUser"
)

for ROLE in "${ROLES[@]}"; do
  echo "  - $ROLE"
  gcloud projects add-iam-policy-binding "$GCP_PROJECT_ID" \
    --member="serviceAccount:$SA_EMAIL" \
    --role="$ROLE" \
    --condition=None \
    >/dev/null 2>&1 || true
done

# Create and store service account key in Secret Manager
echo "🔑 Managing service account key..."

# Enable Secret Manager API
gcloud services enable secretmanager.googleapis.com

# Create key
KEY_FILE="/tmp/firebase-provisioning-sa-key.json"
gcloud iam service-accounts keys create "$KEY_FILE" \
  --iam-account="$SA_EMAIL" 2>/dev/null || echo "Key might already exist, continuing..."

# Base64 encode the key
BASE64_KEY=$(base64 -i "$KEY_FILE")

# Store in Secret Manager
SECRET_NAME="firebase-provisioning-sa-key"
if gcloud secrets describe "$SECRET_NAME" >/dev/null 2>&1; then
  echo "  Updating existing secret..."
  echo -n "$BASE64_KEY" | gcloud secrets versions add "$SECRET_NAME" --data-file=-
else
  echo "  Creating new secret..."
  echo -n "$BASE64_KEY" | gcloud secrets create "$SECRET_NAME" --data-file=-
fi

# Clean up local key file
rm -f "$KEY_FILE"

# Build and deploy
echo "🏗️  Building and deploying to Cloud Run..."

# Set region
REGION="${CLOUD_RUN_REGION:-us-central1}"

# Build the container
gcloud builds submit \
  --tag "gcr.io/$GCP_PROJECT_ID/firebase-provisioning-backend" \
  .

# Deploy to Cloud Run
gcloud run deploy firebase-provisioning-backend \
  --image "gcr.io/$GCP_PROJECT_ID/firebase-provisioning-backend" \
  --platform managed \
  --region "$REGION" \
  --allow-unauthenticated \
  --memory 512Mi \
  --timeout 300 \
  --set-env-vars "NODE_ENV=production" \
  --set-secrets "GCP_SERVICE_ACCOUNT_KEY=${SECRET_NAME}:latest"

# Get the service URL
SERVICE_URL=$(gcloud run services describe firebase-provisioning-backend \
  --region "$REGION" \
  --format="value(status.url)")

echo ""
echo "✅ Deployment complete!"
echo "========================================================"
echo "🌐 Backend URL: $SERVICE_URL"
echo "🔍 Health check: $SERVICE_URL/health"
echo ""
echo "📝 Next steps:"
echo "  1. Update your frontend .env with:"
echo "     VITE_BACKEND_URL=$SERVICE_URL"
echo "  2. Test the health endpoint:"
echo "     curl $SERVICE_URL/health"
echo "  3. Deploy your frontend to Firebase Hosting"
echo ""
