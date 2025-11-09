# Firebase Auto-Provisioning Backend

This backend service automatically creates and configures Firebase projects using Google Cloud Platform APIs.

## Quick Start

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env and add your service account credentials
   ```

3. **Start server:**
   ```bash
   npm start
   # Or for development with auto-reload:
   npm run dev
   ```

4. **Test health endpoint:**
   ```bash
   curl http://localhost:3001/health
   ```

## API Endpoints

### `GET /health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### `POST /api/setupFirebase`
Create a new Firebase project.

**Request:**
```json
{
  "userId": "user_123",
  "projectName": "My Awesome Blog"
}
```

**Response (Success):**
```json
{
  "success": true,
  "projectId": "blog-user123-abc123",
  "config": {
    "apiKey": "AIza...",
    "authDomain": "blog-user123-abc123.firebaseapp.com",
    "projectId": "blog-user123-abc123",
    "storageBucket": "blog-user123-abc123.appspot.com",
    "messagingSenderId": "123456789",
    "appId": "1:123456789:web:abc123",
    "measurementId": "G-ABC123"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Service account credentials not configured"
}
```

### `POST /api/verifyFirebase`
Verify a Firebase configuration is valid.

**Request:**
```json
{
  "config": {
    "apiKey": "AIza...",
    "projectId": "my-project"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Configuration appears valid"
}
```

## Service Account Setup

### Required Permissions

Your service account needs these IAM roles:
- `roles/firebase.admin` - Firebase Admin
- `roles/resourcemanager.projectCreator` - Create projects
- `roles/serviceusage.serviceUsageAdmin` - Enable APIs
- `roles/iam.serviceAccountUser` - Use service accounts

### Creating Service Account

1. **Go to GCP Console:**
   ```
   https://console.cloud.google.com/iam-admin/serviceaccounts
   ```

2. **Create service account:**
   - Click "Create Service Account"
   - Name: `firebase-provisioning-sa`
   - Description: "Service account for Firebase auto-provisioning"

3. **Grant roles:**
   - Add each of the required roles listed above

4. **Create key:**
   - Click on the service account
   - Go to "Keys" tab
   - Click "Add Key" → "Create new key"
   - Choose "JSON"
   - Download the key file

5. **Encode key for .env:**
   ```bash
   cat service-account-key.json | base64 > key.base64
   cat key.base64
   # Copy the output
   ```

6. **Add to .env:**
   ```bash
   GCP_SERVICE_ACCOUNT_KEY=<paste_base64_here>
   ```

## Deployment to Cloud Run

### Automated Deployment

```bash
./deploy.sh
```

This script will:
1. Enable required GCP APIs
2. Create service account (if needed)
3. Build Docker image
4. Deploy to Cloud Run
5. Configure secrets
6. Display service URL

### Manual Deployment

```bash
# Build image
gcloud builds submit --tag gcr.io/YOUR_PROJECT/firebase-provisioning-backend

# Deploy to Cloud Run
gcloud run deploy firebase-provisioning-backend \
  --image gcr.io/YOUR_PROJECT/firebase-provisioning-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --timeout 300 \
  --set-secrets GCP_SERVICE_ACCOUNT_KEY=firebase-provisioning-sa-key:latest
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 3001) |
| `NODE_ENV` | No | Environment (development/production) |
| `FRONTEND_URL` | No | CORS allowed origin |
| `GCP_SERVICE_ACCOUNT_KEY` | Yes | Base64-encoded service account JSON |
| `GCP_ORGANIZATION_ID` | No | GCP organization ID for new projects |
| `GCP_FOLDER_ID` | No | GCP folder ID for new projects |
| `FIRESTORE_LOCATION` | No | Firestore region (default: us-central1) |

## Security

### CORS Configuration
- Default: Allows `http://localhost:5173` in development
- Production: Update `FRONTEND_URL` to your domain

### Service Account Security
- Keys stored in GCP Secret Manager
- Never commit keys to version control
- Rotate keys regularly
- Use least-privilege permissions

### API Security
- Consider adding authentication for production
- Implement rate limiting
- Monitor usage and quotas

## Troubleshooting

### "Service account credentials not configured"
- Verify `GCP_SERVICE_ACCOUNT_KEY` is set in .env
- Check the key is properly base64 encoded
- Ensure the JSON is valid

### "Permission denied" errors
- Verify service account has all required roles
- Check organization/folder permissions
- Ensure APIs are enabled

### "Operation timed out"
- Project creation can take 30-60 seconds
- Check GCP quotas and limits
- Verify network connectivity

### "Firestore creation failed"
- Check Firestore API is enabled
- Verify location is valid
- May need org-level permissions

## Monitoring

### View Logs (Cloud Run)
```bash
gcloud logs read --service firebase-provisioning-backend --limit 50
```

### Check Service Status
```bash
gcloud run services describe firebase-provisioning-backend \
  --region us-central1
```

### Monitor Requests
```bash
gcloud run services list
gcloud logging read "resource.type=cloud_run_revision"
```

## Cost Optimization

- Cloud Run charges only for requests
- Free tier: 2M requests/month
- Optimize cold starts with min instances (if needed)
- Set appropriate memory limits (512Mi is sufficient)

## Development

### Running Tests
```bash
npm test
```

### Code Quality
```bash
npm run lint
```

### Local Docker Testing
```bash
# Build
docker build -t firebase-provisioning-backend .

# Run
docker run -p 3001:3001 \
  -e GCP_SERVICE_ACCOUNT_KEY=$GCP_SERVICE_ACCOUNT_KEY \
  firebase-provisioning-backend
```

## Support

For issues:
1. Check logs in Cloud Run console
2. Verify service account permissions
3. Review troubleshooting section
4. Check Firebase and GCP status pages
