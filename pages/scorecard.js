'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
// ... rest of your imports

import { 
  Home, 
  ClipboardList,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  PlusCircle,
  Menu,
  ChevronDown,
  BugPlay,
  X
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
    // Calculate hit count considering metric type
    const hitCount = data.filter(item => {
      const percentage = (item.actual / item.goal) * 100;
      return item.metric_type === 'lower_better' 
        ? percentage <= 100 
        : percentage >= 100;
    }).length;
    
    const totalCount = data.length;
    const hitPercentage = (hitCount / totalCount) * 100 || 0;
  
    // Calculate overall progress
    const overallProgress = data.reduce((acc, item) => {
      const percentage = (item.actual / item.goal) * 100;
      return acc + (item.metric_type === 'lower_better' 
        ? Math.max(0, 200 - percentage) 
        : Math.min(percentage, 100));
    }, 0) / totalCount;
  
    // Get highest performing metric
    const bestPerformer = [...data].sort((a, b) => {
      const getScore = (item) => {
        const percentage = (item.actual / item.goal) * 100;
        return item.metric_type === 'lower_better' 
          ? Math.max(0, 200 - percentage)
          : percentage;
      };
      return getScore(b) - getScore(a);
    })[0];
  
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Scorecards Hit Progress */}
        <div className="p-6 rounded-xl bg-[#1a1a1a] shadow-[20px_20px_60px_#0d0d0d,_-20px_-20px_60px_#272727]">
          <div className="relative w-32 h-32 mx-auto">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                className="stroke-current text-gray-700"
                strokeWidth="10"
                fill="transparent"
                r="45"
                cx="50"
                cy="50"
              />
              <circle
                className="stroke-current text-blue-500"
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
  
        {/* Overall Progress */}
        <div className="p-6 rounded-xl bg-[#1a1a1a] shadow-[20px_20px_60px_#0d0d0d,_-20px_-20px_60px_#272727]">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">Performance Overview</h3>
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <span className="text-gray-400">Overall Progress</span>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-blue-400">
                  {overallProgress.toFixed(1)}%
                </span>
                <span className="text-sm text-gray-500 mb-1">average</span>
              </div>
            </div>
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full bg-blue-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>
  
        {/* Top Performer */}
        <div className="p-6 rounded-xl bg-[#1a1a1a] shadow-[20px_20px_60px_#0d0d0d,_-20px_-20px_60px_#272727]">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">Top Performer</h3>
          {bestPerformer && (
            <div className="space-y-3">
              <div className="text-sm text-gray-400">{bestPerformer.scorecard_name}</div>
              <div className="flex items-center gap-3">
                <div className="text-3xl font-bold text-green-500">
                  {((bestPerformer.actual / bestPerformer.goal) * 100).toFixed(1)}%
                </div>
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <div className="text-sm text-gray-500">Owned by {bestPerformer.owner}</div>
            </div>
          )}
        </div>
      </div>
    );
  };

const ScoreCard = ({ item }) => {
    const percentage = (item.actual / item.goal) * 100;
    const isLowerBetter = item.metric_type === 'lower_better';
    const isHit = isLowerBetter ? percentage <= 100 : percentage >= 100;
    
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
              Target: {isLowerBetter ? '≤' : ''}{item.goal.toLocaleString()}
            </div>
          </div>
  
          {/* Right side - Progress and Status */}
          <div className="flex flex-col items-end gap-2 min-w-[140px]">
            <div className="flex items-center gap-2">
              {isHit ? (
                <TrendingDown className={`w-5 h-5 ${isLowerBetter ? 'text-green-500' : 'text-red-500'}`} />
              ) : (
                <TrendingUp className={`w-5 h-5 ${isLowerBetter ? 'text-red-500' : 'text-green-500'}`} />
              )}
              <span className={`text-2xl font-bold ${
                isHit ? 'text-green-500' : 'text-red-500'
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
              isHit ? 'bg-green-500' : 'bg-red-500'
            }`}
            style={{ 
              width: `${Math.min(percentage, 100)}%`,
              marginLeft: isLowerBetter ? `${Math.max(0, percentage - 100)}%` : '0'
            }}
          />
        </div>
      </div>
    );
  };

// Add after your existing components
const DebugConsole = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn
    };

    console.log = (...args) => {
      setLogs(prev => [...prev, { type: 'log', content: args, timestamp: new Date() }]);
      originalConsole.log(...args);
    };

    console.error = (...args) => {
      setLogs(prev => [...prev, { type: 'error', content: args, timestamp: new Date() }]);
      originalConsole.error(...args);
    };

    console.warn = (...args) => {
      setLogs(prev => [...prev, { type: 'warn', content: args, timestamp: new Date() }]);
      originalConsole.warn(...args);
    };

    return () => {
      console.log = originalConsole.log;
      console.error = originalConsole.error;
      console.warn = originalConsole.warn;
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-[#1a1a1a] rounded-xl w-full max-w-3xl m-4 shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-blue-400">Debug Console</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="h-96 overflow-auto p-4 bg-[#222] font-mono text-sm">
          {logs.map((log, index) => (
            <div 
              key={index} 
              className={`mb-2 ${
                log.type === 'error' ? 'text-red-400' : 
                log.type === 'warn' ? 'text-yellow-400' : 
                'text-gray-300'
              }`}
            >
              <span className="text-gray-500">[{log.timestamp.toLocaleTimeString()}] </span>
              <span className="text-gray-400">{log.type.toUpperCase()}: </span>
              {JSON.stringify(log.content)}
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-gray-800 flex justify-end">
          <button
            onClick={() => {
              const logText = logs.map(log => 
                `[${log.timestamp.toLocaleTimeString()}] ${log.type.toUpperCase()}: ${JSON.stringify(log.content)}`
              ).join('\n');
              navigator.clipboard.writeText(logText);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Copy Logs
          </button>
        </div>
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
  const [debugConsoleOpen, setDebugConsoleOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Weekly L10 Scorecard', href: '/scorecard', icon: ClipboardList },
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
  className={`fixed h-full z-40 flex flex-col transition-all duration-300 ${
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
  
  <nav className="mt-8 flex-1">
    {navItems.map(renderSidebarNavItem)}
  </nav>

  {/* Debug Console Button */}
  <button
    onClick={() => setDebugConsoleOpen(true)}
    className="flex items-center gap-2 px-4 py-3 text-gray-400 hover:bg-[#222] transition-colors w-full"
  >
    <BugPlay className="w-6 h-6" />
    {sidebarOpen && <span>Debug Console</span>}
  </button>
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
      <DebugConsole 
  isOpen={debugConsoleOpen} 
  onClose={() => setDebugConsoleOpen(false)} 
/>
    </div>
  );
}