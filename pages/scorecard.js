import React, { useState, useEffect } from 'react';
import { Home, BarChart2, Users, Settings, Menu } from 'lucide-react';

export default function Scorecard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Marketing');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const departments = ['Marketing', 'Creative', 'Sales', 'Product', 'Other'];

  const neumorphicStyle = {
    backgroundColor: '#1a1a1a',
    boxShadow: '20px 20px 60px #0d0d0d, -20px -20px 60px #272727'
  };

  const cardStyle = {
    backgroundColor: '#1a1a1a',
    boxShadow: '8px 8px 16px #0d0d0d, -8px -8px 16px #272727'
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/getScorecardData?department=${activeTab}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const jsonData = await response.json();
      setData(jsonData);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const getStatusColor = (actual, goal) => {
    const percentage = (actual / goal) * 100;
    if (percentage >= 100) return 'text-green-500';
    if (percentage >= 80) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusBadge = (actual, goal) => {
    const percentage = (actual / goal) * 100;
    if (percentage >= 100) {
      return (
        <span className="px-3 py-1 text-sm rounded-full bg-green-500/20 text-green-500 font-semibold">
          Hit!
        </span>
      );
    }
    return (
      <span className="px-3 py-1 text-sm rounded-full bg-red-500/20 text-red-500 font-semibold">
        Missed
      </span>
    );
  };

  if (loading) {
    return <div className="p-8 text-gray-300">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-400">Error: {error}</div>;
  }

  return (
    <div className="flex h-screen bg-[#1a1a1a]">
      {/* Main Content */}
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-8 text-blue-400">Weekly L10 Scorecard</h1>

          {/* Department Tabs */}
          <div className="flex space-x-1 mb-8" style={cardStyle}>
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setActiveTab(dept)}
                className={`px-6 py-3 rounded-lg transition-all ${
                  activeTab === dept 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-400 hover:bg-[#222]'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* Scorecard List */}
          <div style={neumorphicStyle} className="rounded-xl p-6">
            {data.map((item, index) => (
              <div 
                key={index}
                className="mb-4 p-6 rounded-lg hover:bg-[#222] transition-all"
                style={cardStyle}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-200 mb-2">
                      {item.scorecard_name}
                    </h3>
                    <div className="flex items-center space-x-8">
                      <div>
                        <span className="text-gray-500 text-sm">Goal</span>
                        <p className="text-gray-300">{item.goal}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 text-sm">Actual</span>
                        <p className={getStatusColor(item.actual, item.goal)}>
                          {item.actual}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 text-sm">Progress</span>
                        <p className={getStatusColor(item.actual, item.goal)}>
                          {((item.actual / item.goal) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <span className="text-gray-500 text-sm">Owner</span>
                      <p className="text-gray-300">{item.owner}</p>
                    </div>
                    {getStatusBadge(item.actual, item.goal)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}