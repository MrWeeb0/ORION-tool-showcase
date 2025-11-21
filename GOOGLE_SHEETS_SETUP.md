# Google Sheets Integration Setup Guide for Orion

This guide will help you connect your email capture form to Google Sheets using Google Apps Script.

## Prerequisites
- A Google Account
- Access to Google Drive
- A Google Sheet to store subscriber emails

## Step-by-Step Setup

### Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **"+ New"** to create a blank spreadsheet
3. Name it **"Orion Subscribers"** (or your preferred name)
4. Add column headers in the first row:
   - A1: `Email`
   - B1: `Timestamp`
   - C1: `Source`

### Step 2: Create a Google Apps Script

1. From your Google Sheet, go to **Extensions** → **Apps Script**
2. You'll be taken to the Apps Script editor
3. Clear any existing code and paste the code below:

```javascript
// Handle POST request from form
function doPost(e) {
  try {
    // Parse the JSON data from the request
    const data = JSON.parse(e.postData.contents);
    const email = data.email;
    const timestamp = data.timestamp;
    const source = data.source;

    // Get the active sheet
    const sheet = SpreadsheetApp.getActiveSheet();
    
    // Append the data as a new row
    sheet.appendRow([email, timestamp, source]);

    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Email added successfully'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Log the error
    Logger.log('Error: ' + error.toString());
    
    // Return error response
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle GET requests (optional, for testing)
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'Google Apps Script is working!'
  })).setMimeType(ContentService.MimeType.JSON);
}
```

### Step 3: Deploy the Script

1. Click the **"Deploy"** button (top right)
2. Select **"New Deployment"**
3. Click the dropdown and select **"Web app"**
4. Configure deployment:
   - **Execute as**: Your Google Account (or a service account)
   - **Who has access**: **"Anyone"** (important for public form)
5. Click **"Deploy"**
6. You'll see a popup with your deployment URL
7. **Copy the URL** - you'll need this for your website

### Step 4: Update Your Website

1. Open **`script.js`** in your project
2. Find this line:
```javascript
GOOGLE_APPS_SCRIPT_URL: 'https://script.google.com/macros/d/YOUR_SCRIPT_ID/usercall?callback=?',
```

3. Replace `YOUR_SCRIPT_ID` with the URL you copied from step 3
4. It should look like:
```javascript
GOOGLE_APPS_SCRIPT_URL: 'https://script.google.com/macros/d/AKfycbzXXXXXXXXXXX/usercall',
```

### Step 5: Test the Integration

1. Open your website
2. Scroll to the email capture form
3. Enter a test email address
4. Click **"Subscribe"**
5. Check your Google Sheet - the new email should appear in a new row

## Updating Your Google Apps Script

If you need to make changes to the script:

1. Go to **Extensions** → **Apps Script** from your Google Sheet
2. Make your changes
3. Click **"Deploy"** → **"Manage Deployments"**
4. Find your web app deployment and click the edit icon
5. Update the script and save
6. Click **"Deploy"**
7. The new version will be live immediately

## Troubleshooting

### "Failed to subscribe" error
- Check that the Google Apps Script URL is correctly copied
- Ensure the deployment is set to **"Anyone"** has access
- Check browser console for more details (F12 → Console tab)

### Emails not appearing in Google Sheet
- Open Apps Script (Extensions → Apps Script)
- Click **"Executions"** to see error logs
- Check that your Google Sheet has the correct column headers

### CORS Error
- This is expected behavior - the script uses `no-cors` mode
- The data IS being sent to Google Sheets despite the CORS warning
- Check your Google Sheet to confirm data is saved

## Security Considerations

⚠️ **Important**: Anyone with access to your website can submit emails to your sheet.

If you want to add extra security:

1. Add duplicate email checking:
```javascript
// Check if email already exists
const range = sheet.getDataRange();
const values = range.getValues();
for (let i = 1; i < values.length; i++) {
  if (values[i][0] === email) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'exists',
      message: 'Email already subscribed'
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

2. Add email validation on the server side

3. Implement rate limiting to prevent spam

## Alternative: Using FormSubmit

If you prefer a simpler setup without Google Apps Script, you can use [FormSubmit](https://formsubmit.co/):

1. Replace the form action in `index.html`:
```html
<form action="https://formsubmit.co/YOUR_EMAIL@gmail.com" method="POST">
```

2. No backend setup needed, but less customization available

## Need Help?

- Check the [Google Apps Script documentation](https://developers.google.com/apps-script)
- Review the [Google Sheets API documentation](https://developers.google.com/sheets/api)
- Test your script using the Apps Script debugger

## Production Checklist

- [ ] Google Sheet created and organized
- [ ] Google Apps Script deployed
- [ ] Script URL updated in `script.js`
- [ ] Test form submission works
- [ ] Email appears in Google Sheet within 10 seconds
- [ ] Success message displays to user
- [ ] Consider adding duplicate email detection
- [ ] Monitor submission logs in Apps Script executions
