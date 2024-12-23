// pages/api/getData.js
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
      // First, get the sheet metadata to find available sheets
      const spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId: process.env.SHEET_ID,
      });

      // Get the first sheet's title
      const firstSheet = spreadsheet.data.sheets[0];
      const sheetTitle = firstSheet.properties.title;

      console.log('Available sheet:', sheetTitle);

      // Now get the data using the first available sheet
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SHEET_ID,
        range: `${sheetTitle}!A1:B`,
      });

      console.log('Sheet Response:', {
        hasData: !!response.data.values,
        rowCount: response.data.values?.length || 0,
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        console.log('No data found in sheet');
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).json([]);
      }

      // Get headers and validate them
      const headers = rows[0];
      console.log('Headers found:', headers);

      // Map data with validation
      const data = rows.slice(1).map((row, index) => {
        const value = parseFloat(row[1]);
        if (isNaN(value)) {
          console.warn(`Invalid value at row ${index + 2}:`, row[1]);
        }
        return {
          date: row[0] || `Row ${index + 2}`,
          value: isNaN(value) ? 0 : value
        };
      });

      console.log('Processed data count:', data.length);

      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json(data);

    } catch (sheetError) {
      console.error('Sheet Error:', {
        message: sheetError.message,
        code: sheetError.code,
        status: sheetError.status
      });
      return res.status(500).json({ 
        error: 'Sheet error',
        details: sheetError.message,
        sheet: {
          id: process.env.SHEET_ID,
          error: sheetError.message
        }
      });
    }

  } catch (error) {
    console.error('General Error:', {
      message: error.message,
      stack: error.stack
    });
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