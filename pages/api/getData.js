import { google } from 'googleapis';

export default async function handler(req, res) {
  try {
    // First, log environment variables (will be sanitized in logs)
    console.log('Checking environment variables:');
    console.log('GOOGLE_CLIENT_EMAIL exists:', !!process.env.GOOGLE_CLIENT_EMAIL);
    console.log('GOOGLE_PRIVATE_KEY exists:', !!process.env.GOOGLE_PRIVATE_KEY);
    console.log('SHEET_ID exists:', !!process.env.SHEET_ID);

    // For immediate testing, return dummy data
    const dummyData = [
      { date: '2024-01-01', value: 100 },
      { date: '2024-01-02', value: 150 },
      { date: '2024-01-03', value: 200 }
    ];

    // Comment out the Google Sheets code temporarily
    /*
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SHEET_ID,
      range: 'Sheet1!A1:Z',
    });

    const rows = response.data.values;
    const headers = rows[0];
    const data = rows.slice(1).map(row => {
      const item = {};
      headers.forEach((header, index) => {
        item[header] = row[index];
      });
      return item;
    });
    */

    // Return dummy data for now
    return res.status(200).json(dummyData);

  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return res.status(500).json({ 
      error: 'Failed to fetch data',
      details: error.message 
    });
  }
}