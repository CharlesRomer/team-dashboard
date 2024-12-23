// pages/api/getScorecardData.js
import { google } from 'googleapis';
import { validateDepartment, validateDateRange } from '@/utils/validation';

// Cache configuration
const CACHE_DURATION = 60 * 1000; // 1 minute
const cache = new Map();

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { department = 'Marketing', startDate, endDate } = req.query;

    // Validate department
    const departmentValidation = validateDepartment(department);
    if (!departmentValidation.isValid) {
      return res.status(400).json({ 
        error: 'Invalid department',
        details: departmentValidation.errors 
      });
    }

    // Validate date range if provided
    if (startDate && endDate) {
      const dateValidation = validateDateRange(startDate, endDate);
      if (!dateValidation.isValid) {
        return res.status(400).json({ 
          error: 'Invalid date range',
          details: dateValidation.errors 
        });
      }
    }

    // Check cache
    const cacheKey = `${department}-${startDate}-${endDate}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      console.log('Serving from cache for:', cacheKey);
      return res.status(200).json(cachedData.data);
    }

    // Initialize Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    // Get sheet data
    const sheetTitle = `${departmentValidation.data}_Scorecard`;
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SHEET_ID,
      range: `${sheetTitle}!A1:F`,
      valueRenderOption: 'UNFORMATTED_VALUE',
      dateTimeRenderOption: 'FORMATTED_STRING'
    });

    const rows = response.data.values || [];
    
    if (rows.length === 0) {
      return res.status(404).json({
        error: 'No data found',
        details: `${sheetTitle} sheet is empty`
      });
    }

    // Process headers
    const headers = rows[0].map(header => header.toLowerCase().trim());
    const requiredColumns = ['scorecard_name', 'goal', 'actual', 'owner', 'date', 'metric_type'];
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));
    
    if (missingColumns.length > 0) {
      return res.status(400).json({
        error: 'Invalid sheet structure',
        details: `Missing required columns: ${missingColumns.join(', ')}`
      });
    }

    // Map column indices
    const columnIndices = requiredColumns.reduce((acc, col) => {
      acc[col] = headers.indexOf(col);
      return acc;
    }, {});

    // Process data
    let formattedData = rows.slice(1).map((row, index) => {
      try {
        return {
          scorecard_name: row[columnIndices.scorecard_name] || '',
          goal: parseFloat(row[columnIndices.goal]) || 0,
          actual: parseFloat(row[columnIndices.actual]) || 0,
          owner: row[columnIndices.owner] || 'Unassigned',
          date: row[columnIndices.date] ? new Date(row[columnIndices.date]) : new Date(),
          metric_type: row[columnIndices.metric_type] || 'higher_better'
        };
      } catch (error) {
        console.warn(`Error processing row ${index + 2}:`, error);
        return null;
      }
    }).filter(Boolean); // Remove any null entries from failed processing

    // Filter by date if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      
      formattedData = formattedData.filter(item => 
        item.date && item.date >= start && item.date <= end
      );
    }

    // Update cache
    cache.set(cacheKey, {
      timestamp: Date.now(),
      data: formattedData
    });

    // Set cache control headers
    res.setHeader('Cache-Control', `s-maxage=${CACHE_DURATION}`);
    return res.status(200).json(formattedData);

  } catch (error) {
    console.error('API Error:', {
      message: error.message,
      stack: error.stack
    });

    // Clear cache on error
    cache.clear();

    return res.status(500).json({ 
      error: 'Failed to fetch scorecard data',
      details: error.message,
      department: req.query.department
    });
  }
}