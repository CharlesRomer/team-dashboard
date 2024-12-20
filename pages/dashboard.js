import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Home, BarChart2, Users, Settings, Menu } from 'lucide-react';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/getData');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonData = await response.json();
        setData(Array.isArray(jsonData) ? jsonData : []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const navItems = [
    { name: 'Dashboard', icon: Home, active: true },
    { name: 'Analytics', icon: BarChart2, active: false },
    { name: 'Team', icon: Users, active: false },
    { name: 'Settings', icon: Settings, active: false },
  ];

  const neumorphicStyle = {
    backgroundColor: '#1a1a1a',
    boxShadow: '20px 20px 60px #0d0d0d, -20px -20px 60px #272727'
  };

  const cardStyle = {
    backgroundColor: '#1a1a1a',
    boxShadow: '8px 8px 16px #0d0d0d, -8px -8px 16px #272727'
  };

  const renderSidebarNavItem = (item) => {
    const Icon = item.icon;
    return (
      <button
        key={item.name}
        className={"flex items-center px-4 py-3 w-full text-gray-300 hover:bg-[#222] transition-colors " + 
          (item.active ? 'text-blue-400 bg-[#222]' : '')}
      >
        <Icon className="w-6 h-6" />
        {sidebarOpen && <span className="ml-4">{item.name}</span>}
      </button>
    );
  };

  if (error) {
    return (
      <div className="p-6 min-h-screen bg-[#1a1a1a] text-gray-200">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <div style={cardStyle} className="p-4 rounded-xl text-red-400">
          Error: {error}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 min-h-screen bg-[#1a1a1a] text-gray-200">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <div style={cardStyle} className="p-4 rounded-xl">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#1a1a1a]">
      {/* Sidebar */}
      <div 
        style={cardStyle} 
        className={"fixed h-full z-40 " + 
          (sidebarOpen ? 'w-64' : 'w-20') + 
          " transition-all duration-300"}
      >
        <div className="flex items-center justify-between p-4">
          {sidebarOpen && <span className="text-xl font-bold text-blue-400">Menu</span>}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-[#222]"
          >
            <Menu className="w-6 h-6 text-gray-400" />
          </button>
        </div>
        <nav className="mt-8">
          {navItems.map(renderSidebarNavItem)}
        </nav>
      </div>

      {/* Main Content */}
      <div className={"flex-1 " + (sidebarOpen ? 'ml-64' : 'ml-20') + " transition-all duration-300"}>
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-8 text-blue-400">Dashboard</h1>
          
          {/* Chart */}
          <div style={neumorphicStyle} className="rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-300">Value Trend</h2>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#888" 
                    tick={{ fill: '#888' }}
                  />
                  <YAxis 
                    stroke="#888"
                    tick={{ fill: '#888' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#272727', 
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '4px 4px 8px #0d0d0d, -4px -4px 8px #272727'
                    }}
                    labelStyle={{ color: '#888' }}
                    itemStyle={{ color: '#4f46e5' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#4f46e5"
                    strokeWidth={3}
                    dot={{ 
                      fill: '#4f46e5',
                      strokeWidth: 2,
                      r: 6,
                      strokeDasharray: ''
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { title: 'Latest Value', value: data[data.length - 1]?.value || 0 },
              { title: 'Average Value', value: (data.reduce((acc, curr) => acc + curr.value, 0) / data.length).toFixed(2) },
              { title: 'Total Entries', value: data.length }
            ].map((stat, index) => (
              <div 
                key={index}
                style={cardStyle}
                className="rounded-xl p-6 transition-all duration-300 hover:translate-y-[-5px]"
              >
                <h3 className="text-sm text-gray-400 mb-2">{stat.title}</h3>
                <p className="text-2xl font-bold text-blue-400">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Data Table */}
          <div style={neumorphicStyle} className="rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-300">Data Table</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    {Object.keys(data[0] || {}).map((header) => (
                      <th 
                        key={header} 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, index) => (
                    <tr 
                      key={index} 
                      className="hover:bg-[#222] transition-colors duration-150"
                    >
                      {Object.values(row).map((value, i) => (
                        <td 
                          key={i} 
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-300"
                        >
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
      </div>
    </div>
  );
}