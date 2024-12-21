import { google } from 'googleapis';

export default async function handler(req, res) {
  try {
    // Debug logs
    console.log('Environment Check:');
    console.log('GOOGLE_CLIENT_EMAIL exists:', !!process.env.GOOGLE_CLIENT_EMAIL);
    console.log('GOOGLE_PRIVATE_KEY exists:', !!process.env.GOOGLE_PRIVATE_KEY);
    console.log('SHEET_ID exists:', !!process.env.SHEET_ID);

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SHEET_ID,
        range: 'Sheet1!A1:B', // Make sure this matches your sheet name exactly
      });

      console.log('Sheet Response:', response.data);

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).json([]);
      }

      const headers = rows[0];
      const data = rows.slice(1).map(row => ({
        date: row[0],
        value: parseFloat(row[1])
      }));

      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json(data);

    } catch (sheetError) {
      console.error('Sheet Error:', sheetError);
      return res.status(500).json({ 
        error: 'Sheet error',
        details: sheetError.message
      });
    }

  } catch (error) {
    console.error('General Error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch data',
      details: error.message,
      env: {
        hasClientEmail: !!process.env.GOOGLE_CLIENT_EMAIL,
        hasPrivateKey: !!process.env.GOOGLE_PRIVATE_KEY,
        hasSheetId: !!process.env.SHEET_ID
      }
    });
  }
}