import { google } from 'googleapis';

export default async function handler(req, res) {
  try {
    const { department } = req.query;
    
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
      range: `${department}_Scorecard!A2:D`, // Skip header row
    });

    const rows = response.data.values || [];
    const data = rows.map(row => ({
      scorecard_name: row[0],
      goal: parseFloat(row[1]),
      actual: parseFloat(row[2]),
      owner: row[3]
    }));

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Failed to fetch data' });
  }
}