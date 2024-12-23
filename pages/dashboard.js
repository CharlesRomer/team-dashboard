import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const SHEET_ID = "YOUR_SHEET_ID"; // Replace with your Google Sheet ID
  const API_KEY = "YOUR_API_KEY"; // Replace with your Google Sheets API Key
  const SHEET_NAME = "Sheet1"; // Replace with the name of your sheet/tab

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`
      );
      const rows = response.data.values;
      const headers = rows[0];
      const rowsData = rows.slice(1).map((row) =>
        Object.fromEntries(headers.map((header, index) => [header, row[index]]))
      );
      setData(rowsData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  // Transform data for charts
  const chartLabels = data.map((row) => row.Date);
  const metric1Data = data.map((row) => parseInt(row["Metric 1"], 10));
  const metric2Data = data.map((row) => parseInt(row["Metric 2"], 10));

  const lineChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Metric 1",
        data: metric1Data,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
      },
      {
        label: "Metric 2",
        data: metric2Data,
        borderColor: "rgba(153, 102, 255, 1)",
        backgroundColor: "rgba(153, 102, 255, 0.2)",
      },
    ],
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-xl font-bold mb-2">Metrics Over Time</h2>
          <Line data={lineChartData} />
        </div>
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-xl font-bold mb-2">Data Table</h2>
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr>
                {Object.keys(data[0] || {}).map((key) => (
                  <th
                    key={key}
                    className="border border-gray-200 p-2 bg-gray-100"
                  >
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value, i) => (
                    <td key={i} className="border border-gray-200 p-2">
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}