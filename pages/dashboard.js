import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Home, 
  BarChart2, 
  Users, 
  Settings, 
  Menu, 
  ClipboardList, 
  RefreshCw,
  AlertCircle,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedSection, setExpandedSection] = useState('all');
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async (showRefreshState = true) => {
    if (showRefreshState) {
      setRefreshing(true);
    }
    try {
      const response = await fetch('/api/getData');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const jsonData = await response.json();
      setData(Array.isArray(jsonData) ? jsonData : []);
      setLastUpdated(new Date().toLocaleTimeString());
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
      if (showRefreshState) {
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    fetchData(false);
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(() => fetchData(false), 300000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, active: router.pathname === '/dashboard' },
    { name: 'Weekly L10 Scorecard', href: '/scorecard', icon: ClipboardList, active: router.pathname === '/scorecard' },
    { name: 'Analytics', href: '/analytics', icon: BarChart2, active: router.pathname === '/analytics' },
    { name: 'Team', href: '/team', icon: Users, active: router.pathname === '/team' },
    { name: 'Settings', href: '/settings', icon: Settings, active: router.pathname === '/settings' },
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
        onClick={() => router.push(item.href)}
        className={`flex items-center px-4 py-3 w-full text-gray-300 hover:bg-[#222] transition-all duration-300 ${
          item.active ? 'text-blue-400 bg-[#222]' : ''
        }`}
      >
        <Icon className={`w-6 h-6 transition-transform duration-300 ${item.active ? 'scale-110' : ''}`} />
        {sidebarOpen && (
          <span className={`ml-4 transition-opacity duration-300 ${item.active ? 'opacity-100' : 'opacity-70'}`}>
            {item.name}
          </span>
        )}
      </button>
    );
  };

  const renderHeader = () => (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-blue-400">Dashboard</h1>
        {lastUpdated && (
          <p className="text-sm text-gray-500 mt-1">
            Last updated: {lastUpdated}
          </p>
        )}
      </div>
      <button 
        onClick={() => fetchData()} 
        disabled={refreshing}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-all duration-300 ${
          refreshing ? 'opacity-70 cursor-not-allowed' : ''
        }`}
      >
        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        {refreshing ? 'Refreshing...' : 'Refresh Data'}
      </button>
    </div>
  );

  const renderErrorState = () => (
    <div className="p-6 min-h-screen bg-[#1a1a1a] text-gray-200">
      {renderHeader()}
      <div style={cardStyle} className="p-6 rounded-xl">
        <div className="flex items-center gap-3 text-red-400">
          <AlertCircle className="w-6 h-6" />
          <div>
            <h3 className="font-semibold">Error Loading Dashboard</h3>
            <p className="text-sm opacity-90">{error}</p>
          </div>
        </div>
        <button
          onClick={() => fetchData()}
          className="mt-4 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  const renderLoadingState = () => (
    <div className="p-6 min-h-screen bg-[#1a1a1a] text-gray-200">
      {renderHeader()}
      <div className="space-y-6">
        <div style={cardStyle} className="h-[400px] rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} style={cardStyle} className="h-32 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? 'all' : section);
  };

  if (error) return renderErrorState();
  if (loading) return renderLoadingState();

  return (
    <div className="flex h-screen bg-[#1a1a1a]">
      {/* Sidebar */}
      <div 
        style={cardStyle} 
        className={`fixed h-full z-40 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="flex items-center justify-between p-4">
          {sidebarOpen && <span className="text-xl font-bold text-blue-400">Menu</span>}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-[#222] transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-400" />
          </button>
        </div>
        <nav className="mt-8">
          {navItems.map(renderSidebarNavItem)}
        </nav>
      </div>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="p-8">
          {renderHeader()}
          
          {/* Chart Section */}
          <div style={neumorphicStyle} className="rounded-xl p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-300">Value Trend</h2>
              <button
                onClick={() => toggleSection('chart')}
                className="p-2 hover:bg-[#222] rounded-lg transition-colors"
              >
                {expandedSection === 'chart' ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
            {(expandedSection === 'all' || expandedSection === 'chart') && (
              <div className="h-[400px] transition-all duration-300">
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
                      activeDot={{
                        r: 8,
                        stroke: '#4f46e5',
                        strokeWidth: 2,
                        fill: '#272727'
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { 
                title: 'Latest Value', 
                value: data[data.length - 1]?.value || 0,
                change: ((data[data.length - 1]?.value - data[data.length - 2]?.value) / data[data.length - 2]?.value * 100).toFixed(1)
              },
              { 
                title: 'Average Value', 
                value: (data.reduce((acc, curr) => acc + curr.value, 0) / data.length).toFixed(2) 
              },
              { 
                title: 'Total Entries', 
                value: data.length,
                subtitle: `Last 30 days` 
              }
            ].map((stat, index) => (
              <div 
                key={index}
                style={cardStyle}
                className="rounded-xl p-6 transition-all duration-300 hover:translate-y-[-5px]"
              >
                <h3 className="text-sm text-gray-400 mb-2">{stat.title}</h3>
                <p className="text-2xl font-bold text-blue-400">{stat.value}</p>
                {stat.change && (
                  <p className={`text-sm mt-2 ${
                    parseFloat(stat.change) >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {parseFloat(stat.change) >= 0 ? '↑' : '↓'} {Math.abs(stat.change)}%
                  </p>
                )}
                {stat.subtitle && (
                  <p className="text-sm text-gray-500 mt-2">{stat.subtitle}</p>
                )}
              </div>
            ))}
          </div>

          {/* Data Table */}
          <div style={neumorphicStyle} className="rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-300">Data Table</h2>
              <button
                onClick={() => toggleSection('table')}
                className="p-2 hover:bg-[#222] rounded-lg transition-colors"
              >
                {expandedSection === 'table' ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
            {(expandedSection === 'all' || expandedSection === 'table') && (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}