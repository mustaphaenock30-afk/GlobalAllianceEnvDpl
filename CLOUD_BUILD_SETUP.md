# CI/CD Pipeline Setup: Google Cloud Build, Storage, and Cloud CDN

This guide walks you step-by-step through setting up a modern, high-performance CI/CD pipeline on Google Cloud Platform (GCP). Every time you push changes to your GitHub repository, **Google Cloud Build** will compile your React app, deploy the static assets to a **Google Cloud Storage (GCS) Bucket**, and serve them instantly worldwide via **Google Cloud CDN**.

---

## Architecture Overview

```
[GitHub Push] ➔ [Cloud Build Trigger] ➔ [GCS Static Bucket] ➔ [HTTP(S) Load Balancer & Cloud CDN] ➔ [End User]
```

---

## Step 1: Create and Configure the Cloud Storage Bucket

First, we need a Storage Bucket to store and host the static files.

1. Go to the [Google Cloud Console Storage Browser](https://console.cloud.google.com/storage/browser).
2. Click **Create**.
3. Configure the bucket details:
   - **Name**: Give it a unique, globally distinct name (e.g., `global-alliance-environment-web-bucket`).
   - **Location type**: Choose **Region** or **Multi-region** depending on your latency requirements.
   - **Storage class**: Select **Standard**.
   - **Access control**: Choose **Uniform** (recommended).
   - Uncheck "Enforce public access prevention on this bucket" (since this is a public static website).
4. Click **Create**.

### Make the Bucket Publicly Readable

1. Once the bucket is created, click the **Permissions** tab.
2. Click **Grant Access**.
3. Under **New principals**, enter `allUsers`.
4. Under **Role**, select **Cloud Storage** > **Storage Object Viewer**.
5. Click **Save** and confirm the public access warning.

### Enable Static Website Hosting

1. Go back to the main Bucket list.
2. Click the **three dots** icon at the far right of your bucket's row and select **Edit website configuration**.
3. Set the following details:
   - **Index (main) page suffix**: `index.html`
   - **Error (404) page**: `index.html` _(This is important for Single Page App client-side routing)_
4. Click **Save**.

---

## Step 2: Grant Permissions to the Cloud Build Service Account

Google Cloud Build needs permission to write and delete files in your bucket.

1. Go to the [IAM & Admin Page](https://console.cloud.google.com/iam-admin/iam).
2. Find the service account used by Cloud Build. It usually looks like:
   - `[PROJECT_NUMBER]@cloudbuild.gserviceaccount.com` OR
   - `service-[PROJECT_NUMBER]@gcp-sa-cloudbuild.iam.gserviceaccount.com` (for newer projects)
3. Click the **Edit** (pencil) icon next to it.
4. Click **Add Another Role**.
5. Select **Cloud Storage** > **Storage Admin** (or **Storage Object Admin**).
6. Click **Save**.

---

## Step 3: Configure Cloud Build Trigger with GitHub

Now we link Cloud Build to your GitHub repository so it watches for changes.

1. Go to the [Cloud Build Triggers Page](https://console.cloud.google.com/cloud-build/triggers).
2. Click **Create Trigger**.
3. Set the following fields:
   - **Name**: `deploy-to-gcs`
   - **Event**: `Push to a branch`
   - **Source**: Click **Connect New Repository** and link your GitHub account. Select this repository and your production branch (e.g., `main` or `master`).
   - **Configuration**: Select **Cloud Build configuration file (yaml or json)**.
   - **Location**: Inline / `cloudbuild.config.yaml` (the file we created in the repo).
4. Under **Advanced** / **Substitution variables**:
   - Add a variable:
     - **Variable**: `_BUCKET_NAME`
     - **Value**: `[Your actual GCS bucket name, e.g., global-alliance-environment-web-bucket]`
5. Click **Create**.

---

## Step 4: Integrate Google Cloud CDN for Faster Delivery

To make the app load lightning-fast worldwide and secure it with a free SSL certificate:

1. Go to the [Network Services > Load Balancing](https://console.cloud.google.com/net-services/loadbalancing/list) page.
2. Click **Create Load Balancer**.
3. Select **Application Load Balancer (HTTP/S)** and click **Start configuration**:
   - Choose **Internet-facing (External)**.
   - Choose **Global external Application Load Balancer**.
4. Configure the Load Balancer:
   - **Frontend configuration**:
     - Protocol: **HTTPS** (secures your site).
     - IP Address: Reserve a static IP address.
     - Certificate: Create a new Google-managed SSL certificate using your custom domain.
   - **Backend configuration**:
     - Create a backend bucket pointing to your GCS Bucket created in Step 1.
     - **CRITICAL**: Check the box for **Enable Cloud CDN**.
     - Keep the default cache settings or optimize cache keys.
   - **Routing rules**: Map incoming traffic to your backend bucket.
5. Click **Create**.

Within 15-30 minutes, Google will provision your SSL certificate and connect Cloud CDN to your domain!

---

## Step 5: Test the Pipeline

1. Push a small commit (or merge a pull request) to your GitHub repository branch.
2. Go to the [Cloud Build History Page](https://console.cloud.google.com/cloud-build/builds) to watch the pipeline execute in real time.
3. Once completed, your new changes are automatically pushed to Cloud Storage and cached on Google Cloud CDN!
