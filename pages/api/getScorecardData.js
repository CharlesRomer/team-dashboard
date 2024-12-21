// pages/api/getScorecardData.js
import { google } from 'googleapis';

export default async function handler(req, res) {
  try {
    const { 
      department = 'Marketing',
      startDate,
      endDate
    } = req.query;
    
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    // Get all data including the metric_type column
    const range = `${department}_Scorecard!A1:F`; // Added metric_type column
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SHEET_ID,
      range,
    });

    const rows = response.data.values || [];
    
    if (rows.length === 0) {
      return res.status(400).json({
        error: 'Empty sheet',
        details: `${department}_Scorecard sheet is empty`
      });
    }

    const headers = rows[0].map(header => header.toLowerCase().trim());
    
    // Get column indices
    const columnIndices = {
      scorecard_name: headers.findIndex(h => h.includes('scorecard_name')),
      goal: headers.findIndex(h => h.includes('goal')),
      actual: headers.findIndex(h => h.includes('actual')),
      owner: headers.findIndex(h => h.includes('owner')),
      date: headers.findIndex(h => h.includes('date')),
      metric_type: headers.findIndex(h => h.includes('metric_type')) // 'higher_better' or 'lower_better'
    };

    // Format data
    let formattedData = rows.slice(1).map(row => ({
      scorecard_name: row[columnIndices.scorecard_name] || '',
      goal: parseFloat(row[columnIndices.goal]) || 0,
      actual: parseFloat(row[columnIndices.actual]) || 0,
      owner: row[columnIndices.owner] || 'Unassigned',
      date: row[columnIndices.date] ? new Date(row[columnIndices.date]) : null,
      metric_type: row[columnIndices.metric_type] || 'higher_better'
    }));

    // Filter by date if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      formattedData = formattedData.filter(item => 
        item.date && item.date >= start && item.date <= end
      );
    }

    // Aggregate data by scorecard name
    const aggregatedData = Object.values(formattedData.reduce((acc, item) => {
      if (!acc[item.scorecard_name]) {
        acc[item.scorecard_name] = {
          scorecard_name: item.scorecard_name,
          goal: item.goal, // Keep original goal
          actual: 0, // Will sum up actuals
          owner: item.owner,
          metric_type: item.metric_type,
          entries: 0 // Track number of entries for averaging if needed
        };
      }
      acc[item.scorecard_name].actual += item.actual;
      acc[item.scorecard_name].entries += 1;
      return acc;
    }, {}));

    res.status(200).json(aggregatedData);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch scorecard data', 
      details: error.message
    });
  }
}