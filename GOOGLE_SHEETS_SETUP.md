# Connecting the Contact Form to Google Sheets

To make the contact form save details directly to a Google Sheet in your GCP-hosted environment, follow these simple steps to set up a Google Apps Script Webhook.

---

## Step 1: Prepare your Google Sheet

1. Create a **new Google Sheet** or open an existing one.
2. In the first row, create the headers for the columns:
   - **Column A**: Timestamp
   - **Column B**: Name
   - **Column C**: Email
   - **Column D**: Subject
   - **Column E**: Message

---

## Step 2: Add the Apps Script

1. In your Google Sheet menu, click **Extensions** > **Apps Script**.
2. Delete any default code in the editor and paste the following script:

```javascript
function doPost(e) {
  try {
    // Parse incoming JSON payload
    var data = JSON.parse(e.postData.contents);

    // Get active sheet
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Append data row
    sheet.appendRow([
      data.timestamp || new Date().toLocaleString(),
      data.name,
      data.email,
      data.subject || "",
      data.message,
    ]);

    // Return success response
    return ContentService.createTextOutput(JSON.stringify({ result: "success" })).setMimeType(
      ContentService.MimeType.JSON,
    );
  } catch (error) {
    // Return error response
    return ContentService.createTextOutput(
      JSON.stringify({ result: "error", error: error.toString() }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle options request for CORS support if needed
function doOptions(e) {
  return ContentService.createTextOutput("").setMimeType(ContentService.MimeType.TEXT);
}
```

3. Click the **Save** icon (floppy disk) or press `Ctrl+S` / `Cmd+S`.

---

## Step 3: Deploy as a Web App

1. Click the **Deploy** button in the top-right corner of the Apps Script editor and select **New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Configure the settings:
   - **Description**: `Contact Form Webhook`
   - **Execute as**: `Me (your email address)`
   - **Who has access**: `Anyone` _(This is important so the secure backend of your app can send POST requests anonymously)_
4. Click **Deploy**.
5. Google will ask you to authorize access. Click **Authorize Access**, select your Google Account, click **Advanced** (under safety warnings), and click **Go to Untitled project (unsafe)** to allow the script to write to your spreadsheet.
6. Once deployed, copy the **Web app URL** from the success screen. It should look like this:
   `https://script.google.com/macros/s/AKfycb.../exec`

---

## Step 4: Configure the Webhook in AI Studio

To link this webhook securely to your app:

1. Go to the **Secrets/Settings** panel in the Google AI Studio UI.
2. Add a new secret/environment variable:
   - **Name**: `GOOGLE_SHEETS_WEBHOOK_URL`
   - **Value**: `[Paste your Web App URL copied in Step 3]`
3. That's it! When a user submits the contact form, the GCP server-side handler will securely transmit it to your spreadsheet automatically without revealing the URL or requiring your visitors to sign in to Google.
