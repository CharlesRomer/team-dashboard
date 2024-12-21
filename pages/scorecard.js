import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Home, 
  BarChart2, 
  Users, 
  Settings, 
  Menu, 
  ClipboardList,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  PlusCircle
} from 'lucide-react';

const departments = ['Marketing', 'Creative', 'Sales', 'Product', 'Other'];

const ScoreCard = ({ item }) => {
  const percentage = (item.actual / item.goal) * 100;
  const isHit = percentage >= 100;
  
  return (
    <div className="p-6 mb-6 rounded-xl bg-[#1a1a1a] shadow-[20px_20px_60px_#0d0d0d,_-20px_-20px_60px_#272727] hover:translate-y-[-2px] transition-all duration-300">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left side - Title and Owner */}
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-200">{item.scorecard_name}</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Owner:</span>
            <span className="text-sm font-medium text-blue-400">{item.owner}</span>
          </div>
        </div>

        {/* Middle - Numbers */}
        <div className="flex flex-col items-center bg-[#222] rounded-xl p-4 min-w-[200px]">
          <div className="text-4xl font-bold text-gray-200 mb-2">
            {item.actual.toLocaleString()}
          </div>
          <div className="text-sm text-gray-400">
            Target: {item.goal.toLocaleString()}
          </div>
        </div>

        {/* Right side - Progress and Status */}
        <div className="flex flex-col items-end gap-2 min-w-[140px]">
          <div className="flex items-center gap-2">
            {percentage >= 100 ? (
              <TrendingUp className="w-5 h-5 text-green-500" />
            ) : (
              <TrendingDown className="w-5 h-5 text-yellow-500" />
            )}
            <span className={`text-2xl font-bold ${
              percentage >= 100 ? 'text-green-500' : 'text-yellow-500'
            }`}>
              {percentage.toFixed(1)}%
            </span>
          </div>
          <div className={`px-4 py-2 rounded-full ${
            isHit 
              ? 'bg-green-500/20 text-green-500 border border-green-500/20' 
              : 'bg-red-500/20 text-red-500 border border-red-500/20'
          }`}>
            {isHit ? 'Hit!' : 'Missed'}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6 w-full h-2 bg-gray-800 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${
            percentage >= 100 ? 'bg-green-500' : 'bg-yellow-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
};

export default function WeeklyScorecard() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDepartment, setActiveDepartment] = useState('Marketing');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Weekly L10 Scorecard', href: '/scorecard', icon: ClipboardList },
    { name: 'Analytics', href: '/analytics', icon: BarChart2 },
    { name: 'Team', href: '/team', icon: Users },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/getScorecardData?department=${activeDepartment}`);
      const jsonData = await response.json();
      setData(Array.isArray(jsonData) ? jsonData : []);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Error fetching data:', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeDepartment]);

  const cardStyle = {
    backgroundColor: '#1a1a1a',
    boxShadow: '8px 8px 16px #0d0d0d, -8px -8px 16px #272727'
  };

  const renderSidebarNavItem = (item) => {
    const Icon = item.icon;
    const isActive = router.pathname === item.href;
    return (
      <button
        key={item.name}
        onClick={() => router.push(item.href)}
        className={`flex items-center px-4 py-3 w-full text-gray-300 hover:bg-[#222] transition-colors ${
          isActive ? 'text-blue-400 bg-[#222]' : ''
        }`}
      >
        <Icon className="w-6 h-6" />
        {sidebarOpen && <span className="ml-4">{item.name}</span>}
      </button>
    );
  };

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
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-blue-400">Weekly L10 Scorecard</h1>
              {lastUpdated && (
                <p className="text-sm text-gray-500 mt-1">
                  Last updated: {lastUpdated}
                </p>
              )}
            </div>
            <button 
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>

          {/* Department Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setActiveDepartment(dept)}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  activeDepartment === dept 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-[#222] text-gray-400 hover:bg-[#333]'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* Scorecard List */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-32 rounded-xl animate-pulse bg-[#222]" />
              ))}
            </div>
          ) : data.length > 0 ? (
            <div className="space-y-4">
              {data.map((item, index) => (
                <ScoreCard key={index} item={item} />
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-[#222] text-gray-400">
              <div className="flex items-center gap-3">
                <PlusCircle className="w-6 h-6" />
                <span>No scorecard items found for {activeDepartment}. Add some data to get started.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}