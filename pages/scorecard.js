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
  PlusCircle,
  Minus
} from 'lucide-react';

const departments = ['Marketing', 'Creative', 'Sales', 'Product', 'Other'];

// Add DateSelector component
const DateSelector = ({ onDateChange }) => {
  const [customRange, setCustomRange] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const getCurrentWeek = () => {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(monday.getDate() - monday.getDay() + 1);
    const sunday = new Date(now);
    sunday.setDate(sunday.getDate() - sunday.getDay() + 7);
    return [monday, sunday];
  };

  const getPreviousWeek = () => {
    const [monday] = getCurrentWeek();
    const prevMonday = new Date(monday);
    prevMonday.setDate(prevMonday.getDate() - 7);
    const prevSunday = new Date(monday);
    prevSunday.setDate(prevSunday.getDate() - 1);
    return [prevMonday, prevSunday];
  };

  return (
    <div className="mb-8 p-4 rounded-xl bg-[#1a1a1a] shadow-[20px_20px_60px_#0d0d0d,_-20px_-20px_60px_#272727]">
      <div className="flex flex-wrap gap-4 items-center">
        <button
          onClick={() => {
            setCustomRange(false);
            onDateChange({ range: 'current', dates: getCurrentWeek() });
          }}
          className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
        >
          Current Week
        </button>
        
        <button
          onClick={() => {
            setCustomRange(false);
            onDateChange({ range: 'previous', dates: getPreviousWeek() });
          }}
          className="px-4 py-2 rounded-lg bg-[#222] hover:bg-[#333] text-gray-300 transition-colors"
        >
          Previous Week
        </button>

        <button
          onClick={() => setCustomRange(!customRange)}
          className="px-4 py-2 rounded-lg bg-[#222] hover:bg-[#333] text-gray-300 transition-colors"
        >
          Custom Range
        </button>

        {customRange && (
          <div className="flex gap-4 items-center">
            <input
              type="date"
              value={startDate || ''}
              onChange={(e) => {
                setStartDate(e.target.value);
                if (endDate) {
                  onDateChange({
                    range: 'custom',
                    dates: [new Date(e.target.value), new Date(endDate)]
                  });
                }
              }}
              className="px-4 py-2 rounded-lg bg-[#222] text-gray-300 border border-gray-700"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={endDate || ''}
              onChange={(e) => {
                setEndDate(e.target.value);
                if (startDate) {
                  onDateChange({
                    range: 'custom',
                    dates: [new Date(startDate), new Date(e.target.value)]
                  });
                }
              }}
              className="px-4 py-2 rounded-lg bg-[#222] text-gray-300 border border-gray-700"
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Add PerformanceSummary component
const PerformanceSummary = ({ data }) => {
  const hitCount = data.filter(item => (item.actual / item.goal) >= 100).length;
  const totalCount = data.length;
  const hitPercentage = (hitCount / totalCount) * 100 || 0;

  // Helper function to get current quarter progress (0-1)
  const getCurrentQuarterProgress = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const quarterMonth = currentMonth % 3;
    const monthProgress = now.getDate() / new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return (quarterMonth * 1 + monthProgress) / 3;
  };

  // Calculate if each metric is on track for the quarter
  const quarterlyTarget = getCurrentQuarterProgress();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Circular Progress */}
      <div className="p-6 rounded-xl bg-[#1a1a1a] shadow-[20px_20px_60px_#0d0d0d,_-20px_-20px_60px_#272727]">
        <div className="relative w-32 h-32 mx-auto">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              className="stroke-current text-gray-700"
              strokeWidth="10"
              fill="transparent"
              r="45"
              cx="50"
              cy="50"
            />
            {/* Progress circle */}
            <circle
              className="stroke-current text-blue-500 transform -rotate-90 origin-center"
              strokeWidth="10"
              strokeDasharray={`${hitPercentage * 2.827}, 282.7`}
              strokeLinecap="round"
              fill="transparent"
              r="45"
              cx="50"
              cy="50"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-blue-400">{hitCount}</span>
            <span className="text-sm text-gray-400">of {totalCount}</span>
          </div>
        </div>
        <p className="text-center mt-4 text-gray-300">Scorecards Hit</p>
      </div>

      {/* Quarterly Progress */}
      <div className="p-6 rounded-xl bg-[#1a1a1a] shadow-[20px_20px_60px_#0d0d0d,_-20px_-20px_60px_#272727]">
        <h3 className="text-lg font-semibold text-gray-200 mb-4">Quarterly Progress</h3>
        <div className="space-y-4">
          {data.map((item, index) => {
            const percentage = (item.actual / item.goal) * 100;
            const isOnTrack = percentage >= (quarterlyTarget * 100);
            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{item.scorecard_name}</span>
                  <span className={isOnTrack ? 'text-green-500' : 'text-yellow-500'}>
                    {isOnTrack ? 'On Track' : 'Behind'}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOnTrack ? 'bg-green-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly Comparison */}
      <div className="p-6 rounded-xl bg-[#1a1a1a] shadow-[20px_20px_60px_#0d0d0d,_-20px_-20px_60px_#272727]">
        <h3 className="text-lg font-semibold text-gray-200 mb-4">Weekly Summary</h3>
        <div className="space-y-4">
          {data.map((item, index) => {
            const percentage = (item.actual / item.goal) * 100;
            return (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-400">{item.scorecard_name}</span>
                <div className="flex items-center gap-2">
                  {percentage >= 100 ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-yellow-500" />
                  )}
                  <span className={`text-sm ${
                    percentage >= 100 ? 'text-green-500' : 'text-yellow-500'
                  }`}>
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Original ScoreCard component
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

// Main Component
export default function WeeklyScorecard() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDepartment, setActiveDepartment] = useState('Marketing');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [dateRange, setDateRange] = useState(null);

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
      let url = `/api/getScorecardData?department=${activeDepartment}`;
      if (dateRange?.dates) {
        url += `&startDate=${dateRange.dates[0].toISOString()}&endDate=${dateRange.dates[1].toISOString()}`;
      }
      
      const response = await fetch(url);
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
  }, [activeDepartment, dateRange]);

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

          {/* Date Selector */}
          <DateSelector onDateChange={setDateRange} />

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

          {/* Performance Summary */}
          {!loading && data.length > 0 && (
            <PerformanceSummary data={data} />
          )}

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