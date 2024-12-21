// pages/api/getScorecardData.js
import { google } from 'googleapis';

export default async function handler(req, res) {
  try {
    const { department = 'Marketing' } = req.query;
    
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    // First, verify if the sheet exists
    try {
      const spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId: process.env.SHEET_ID,
      });
      
      const sheetExists = spreadsheet.data.sheets.some(
        sheet => sheet.properties.title === `${department}_Scorecard`
      );
      
      if (!sheetExists) {
        return res.status(404).json({
          error: `No scorecard found for ${department}`,
          details: `Sheet "${department}_Scorecard" does not exist`
        });
      }
    } catch (error) {
      console.error('Error checking sheet existence:', error);
      return res.status(500).json({
        error: 'Failed to verify sheet existence',
        details: error.message
      });
    }

    // Get the data from the sheet
    const range = `${department}_Scorecard!A1:D`; // Include headers now
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SHEET_ID,
      range,
    });

    const rows = response.data.values || [];
    
    // Verify headers
    if (rows.length === 0) {
      return res.status(400).json({
        error: 'Empty sheet',
        details: `${department}_Scorecard sheet is empty`
      });
    }

    const headers = rows[0].map(header => header.toLowerCase().trim());
    const requiredHeaders = ['scorecard_name', 'goal', 'actual', 'owner'];
    
    // Verify all required headers exist
    const missingHeaders = requiredHeaders.filter(
      required => !headers.some(header => header.includes(required))
    );
    
    if (missingHeaders.length > 0) {
      return res.status(400).json({
        error: 'Invalid sheet structure',
        details: `Missing required columns: ${missingHeaders.join(', ')}`
      });
    }

    // Map column indices
    const columnIndices = {
      scorecard_name: headers.findIndex(h => h.includes('scorecard_name')),
      goal: headers.findIndex(h => h.includes('goal')),
      actual: headers.findIndex(h => h.includes('actual')),
      owner: headers.findIndex(h => h.includes('owner'))
    };

    // Format the data, skipping the header row
    const formattedData = rows.slice(1).map(row => ({
      scorecard_name: row[columnIndices.scorecard_name] || '',
      goal: parseFloat(row[columnIndices.goal]) || 0,
      actual: parseFloat(row[columnIndices.actual]) || 0,
      owner: row[columnIndices.owner] || 'Unassigned'
    }));

    // Filter out any rows where required fields are missing or invalid
    const validData = formattedData.filter(item => 
      item.scorecard_name && 
      !isNaN(item.goal) && 
      !isNaN(item.actual) &&
      item.goal > 0 // Ensure goal is positive
    );

    if (validData.length === 0) {
      return res.status(404).json({
        error: 'No valid data',
        details: `No valid scorecard entries found in ${department}_Scorecard`
      });
    }

    res.status(200).json(validData);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch scorecard data', 
      details: error.message,
      department: req.query.department 
    });
  }
}