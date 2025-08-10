import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  ChartBarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserIcon,
  MagnifyingGlassIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const Finance = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('market');
  const [stockData, setStockData] = useState(null);
  const [searchTicker, setSearchTicker] = useState('');
  const [loading, setLoading] = useState(false);
  const [portfolio, setPortfolio] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [newStock, setNewStock] = useState({
    ticker: '',
    shares: '',
    buy_price: '', // renamed from purchase_price to match backend
    date: '', // Add date field
    type: 'BUY' // Add transaction type field
  });
  // New sell form state
  const [sellFormTicker, setSellFormTicker] = useState(null);
  const [sellForm, setSellForm] = useState({ shares: '', sell_price: '', date: '', type: 'SELL' });
  // New transaction form state for manual entry
  const [newTransaction, setNewTransaction] = useState({
    ticker: '',
    shares: '',
    price: '',
    type: 'BUY',
    date: ''
  });
  const [deleting, setDeleting] = useState(false);
  // New: controls for selecting period or date range
  const [rangeMode, setRangeMode] = useState('period'); // 'period' | 'range'
  const [period, setPeriod] = useState('max');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (user && (activeTab === 'portfolio' || activeTab === 'transactions')) {
      fetchPortfolio();
      if (activeTab === 'transactions') {
        fetchTransactions();
      }
    }
  }, [user, activeTab]);

  const fetchPortfolio = async () => {
    try {
      const response = await axios.get('/api/portfolio/stocks');
      if (response.data.success) {
        setPortfolio(response.data.portfolio || []);
      } else if (response.data.message) {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      toast.error('Failed to load portfolio');
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('/api/transactions');
      if (response.data.success) {
        setTransactions(response.data.transactions || []);
      } else if (response.data.message) {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    }
  };

  const addTransaction = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to add transactions');
      return;
    }
    try {
      setLoading(true);
      const payload = { 
        ticker: newTransaction.ticker.toUpperCase(), 
        shares: newTransaction.shares, 
        price: newTransaction.price,
        type: newTransaction.type,
        date: newTransaction.date || undefined
      };
      const response = await axios.post('/api/transactions', payload);
      if (response.data.success) {
        toast.success(`${newTransaction.type} transaction added successfully`);
        setNewTransaction({ ticker: '', shares: '', price: '', type: 'BUY', date: '' });
        fetchTransactions();
        fetchPortfolio(); // Refresh portfolio as well
      } else if (response.data.message) {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error(error.response?.data?.message || 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  const searchStock = async (e) => {
    e.preventDefault();
    if (!searchTicker.trim()) return;

    // Build payload according to selected mode
    const payload = { ticker_name: searchTicker.toUpperCase() };
    if (rangeMode === 'range') {
      if (!startDate || !endDate) {
        toast.error('Please select start and end dates');
        return;
      }
      payload.start_date = startDate;
      payload.end_date = endDate;
    } else {
      payload.period = period; // string, backend accepts string or array
    }

    try {
      setLoading(true);
      const response = await axios.post('/api/finance/stock-data', payload);
      if (response.data.success) {
        setStockData(response.data.data);
        toast.success(`Loaded data for ${searchTicker.toUpperCase()}`);
      } else {
        toast.error(response.data.message || 'Failed to load stock data');
      }
    } catch (error) {
      console.error('Error searching stock:', error);
      toast.error('Failed to search stock');
    } finally {
      setLoading(false);
    }
  };

  const addToPortfolio = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to add stocks to portfolio');
      return;
    }
    try {
      setLoading(true);
      const payload = { 
        ticker: newStock.ticker.toUpperCase(), 
        shares: newStock.shares, 
        price: newStock.buy_price,
        type: newStock.type,
        date: newStock.date || undefined
      };
      
      // Use the new transaction endpoint instead of the old portfolio endpoint
      const response = await axios.post('/api/transactions', payload);
      if (response.data.success) {
        toast.success(`${newStock.type} transaction added successfully`);
        setNewStock({ ticker: '', shares: '', buy_price: '', date: '', type: 'BUY' });
        setSellForm({ shares: '', sell_price: '', date: '', type: 'SELL' });
        fetchPortfolio();
      } else if (response.data.message) {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error adding stock:', error);
      toast.error(error.response?.data?.message || 'Failed to add stock');
    } finally {
      setLoading(false);
    }
  };

  const openSellForm = (ticker) => {
    if (sellFormTicker === ticker) {
      setSellFormTicker(null);
      setSellForm({ shares: '', sell_price: '', date: '', type: 'SELL' });
    } else {
      setSellFormTicker(ticker);
      setSellForm({ shares: '', sell_price: '', date: '', type: 'SELL' });
    }
  };

  const sellStock = async (e, ticker) => {
    e.preventDefault();
    if (!user) { toast.error('Login required'); return; }
    if (!sellForm.shares || !sellForm.sell_price) { toast.error('Enter shares and price'); return; }
    try {
      setLoading(true);
      const payload = { 
        ticker, 
        shares: sellForm.shares, 
        price: sellForm.sell_price,
        type: 'SELL',
        date: sellForm.date || undefined
      };
      const response = await axios.post('/api/transactions', payload);
      if (response.data.success) {
        toast.success('Sell transaction recorded');
        setSellFormTicker(null);
        setSellForm({ shares: '', sell_price: '', date: '', type: 'SELL' });
        fetchPortfolio();
      } else if (response.data.message) {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error selling stock:', error);
      toast.error(error.response?.data?.message || 'Failed to sell stock');
    } finally {
      setLoading(false);
    }
  };

  const deleteTicker = async (ticker) => {
    if (!user) { toast.error('Login required'); return; }
    if (!window.confirm(`Delete ALL transactions for ${ticker}? This cannot be undone.`)) return;
    try {
      setDeleting(true);
      const response = await axios.delete(`/api/portfolio/stocks/${ticker}`);
      if (response.data.success) {
        toast.success(`${ticker} removed`);
        fetchPortfolio();
      } else if (response.data.message) {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error deleting ticker:', error);
      toast.error(error.response?.data?.message || 'Failed to delete ticker');
    } finally {
      setDeleting(false);
    }
  };

  // Format data for Recharts
  const chartData = stockData ? stockData.labels.map((date, index) => ({
    date: new Date(date).toLocaleDateString(),
    price: stockData.values[index]
  })) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900">
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-6">
              Finance Hub
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Track your investments, analyze market trends, and manage your portfolio with real-time data.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex justify-center mb-12">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-2 border border-white/10">
              {[
                { id: 'market', label: 'Market Analysis', icon: ChartBarIcon },
                { id: 'portfolio', label: 'Add Transactions', icon: CurrencyDollarIcon, requireAuth: true },
                { id: 'transactions', label: 'Transaction History', icon: ClockIcon, requireAuth: true }
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(tab.id)}
                  disabled={tab.requireAuth && !user}
                  className={`flex items-center px-6 py-3 mx-1 rounded-xl font-semibold transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  } ${tab.requireAuth && !user ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <tab.icon className="w-5 h-5 mr-2" />
                  {tab.label}
                  {tab.requireAuth && !user && <UserIcon className="w-4 h-4 ml-2" />}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Market Analysis Tab */}
          {activeTab === 'market' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Stock Search */}
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                <h2 className="text-2xl font-bold text-white mb-6">Stock Market Analysis</h2>
                
                <form onSubmit={searchStock} className="mb-8 space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Enter stock ticker (e.g., AAPL, TSLA, GOOGL)"
                        value={searchTicker}
                        onChange={(e) => setSearchTicker(e.target.value.toUpperCase())}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 flex items-center"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
                          Search
                        </>
                      )}
                    </motion.button>
                  </div>

                  {/* Period vs Date Range Controls */}
                  <div className="grid md:grid-cols-3 gap-4 items-end">
                    <div className="col-span-1">
                      <label className="block text-gray-300 mb-2 font-medium">Mode</label>
                      <div className="flex gap-3">
                        <button type="button" onClick={() => setRangeMode('period')} className={`px-4 py-2 rounded-lg border ${rangeMode==='period' ? 'bg-white/20 border-white/40 text-white' : 'bg-white/10 border-white/20 text-gray-300'}`}>Period</button>
                        <button type="button" onClick={() => setRangeMode('range')} className={`px-4 py-2 rounded-lg border ${rangeMode==='range' ? 'bg-white/20 border-white/40 text-white' : 'bg-white/10 border-white/20 text-gray-300'}`}>Date Range</button>
                      </div>
                    </div>

                    {rangeMode === 'period' ? (
                      <div className="col-span-2">
                        <label className="block text-gray-300 mb-2 font-medium">Period</label>
                        <select
                          value={period}
                          onChange={(e) => setPeriod(e.target.value)}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="1d">1 day</option>
                          <option value="5d">5 days</option>
                          <option value="1mo">1 month</option>
                          <option value="3mo">3 months</option>
                          <option value="6mo">6 months</option>
                          <option value="1y">1 year</option>
                          <option value="2y">2 years</option>
                          <option value="5y">5 years</option>
                          <option value="10y">10 years</option>
                          <option value="ytd">YTD</option>
                          <option value="max">Max</option>
                        </select>
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="block text-gray-300 mb-2 font-medium">Start Date</label>
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-300 mb-2 font-medium">End Date</label>
                          <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </form>

                {/* Stock Chart and Info */}
                {stockData && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 rounded-xl p-6"
                  >
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-white">{stockData.ticker}</h3>
                      {stockData.stock_info && (
                        <p className="text-gray-300">{stockData.stock_info.longName || stockData.ticker}</p>
                      )}
                    </div>
                    
                    {/* Stock Chart */}
                    <div className="h-96 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <XAxis 
                            dataKey="date" 
                            stroke="#e5e7eb"
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis 
                            stroke="#e5e7eb"
                            tick={{ fontSize: 12 }}
                            domain={['dataMin - 5', 'dataMax + 5']}
                          />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: 'rgba(0,0,0,0.8)',
                              border: '1px solid rgba(255,255,255,0.2)',
                              borderRadius: '8px',
                              color: '#fff'
                            }}
                            formatter={(value) => [`$${value.toFixed(2)}`, 'Price']}
                            labelStyle={{ color: '#e5e7eb' }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="price" 
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4, fill: '#3b82f6' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Info box */}
                    {stockData.stock_info && (
                      <div className="mt-6 grid md:grid-cols-3 gap-4">
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <p className="text-gray-400 text-sm">Company</p>
                          <p className="text-white font-semibold">{stockData.stock_info.longName}</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <p className="text-gray-400 text-sm">Sector / Industry</p>
                          <p className="text-white font-semibold">{stockData.stock_info.sector || '—'} / {stockData.stock_info.industry || '—'}</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <p className="text-gray-400 text-sm">52W Range</p>
                          <p className="text-white font-semibold">{(stockData.stock_info.fiftyTwoWeekLow ?? '—')} - {(stockData.stock_info.fiftyTwoWeekHigh ?? '—')}</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10 md:col-span-3">
                          <p className="text-gray-400 text-sm">Dividend Yield</p>
                          <p className="text-white font-semibold">{(stockData.stock_info.dividendYield ?? null) !== null ? `${(((+stockData.stock_info.dividendYield) <= 1 ? (+stockData.stock_info.dividendYield) * 100 : (+stockData.stock_info.dividendYield))).toFixed(2)}%` : '—'}</p>
                        </div>
                        {stockData.stock_info.longBusinessSummary && (
                          <div className="bg-white/5 rounded-lg p-4 border border-white/10 md:col-span-3">
                            <p className="text-gray-400 text-sm">About</p>
                            <p className="text-gray-300">{stockData.stock_info.longBusinessSummary}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}

                {!stockData && (
                  <div className="text-center py-12">
                    <ChartBarIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">Search for a stock to view its chart</p>
                    <p className="text-gray-500 text-sm mt-2">
                      Try popular tickers like AAPL, GOOGL, TSLA, MSFT, or AMZN
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Portfolio Tab */}
          {activeTab === 'portfolio' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {user ? (
                <>
                  {/* Add Stock Form */}
                  <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                    <h2 className="text-2xl font-bold text-white mb-6">Add Transaction to Portfolio</h2>
                    <form onSubmit={addToPortfolio} className="grid md:grid-cols-6 gap-4">
                      <input
                        type="text"
                        placeholder="Ticker (e.g., AAPL)"
                        value={newStock.ticker}
                        onChange={(e) => setNewStock({ ...newStock, ticker: e.target.value.toUpperCase() })}
                        className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                      <input
                        type="number"
                        step="1"
                        placeholder="Shares"
                        value={newStock.shares}
                        onChange={(e) => setNewStock({ ...newStock, shares: e.target.value })}
                        className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Price per Share"
                        value={newStock.buy_price}
                        onChange={(e) => setNewStock({ ...newStock, buy_price: e.target.value })}
                        className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                      <select
                        value={newStock.type}
                        onChange={(e) => setNewStock({ ...newStock, type: e.target.value })}
                        className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      >
                        <option value="BUY">BUY</option>
                        <option value="SELL">SELL</option>
                      </select>
                      <input
                        type="date"
                        value={newStock.date}
                        onChange={(e) => setNewStock({ ...newStock, date: e.target.value })}
                        className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        title="Transaction Date (optional - defaults to today)"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center"
                      >
                        {loading ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                          <>Add {newStock.type}</>
                        )}
                      </motion.button>
                    </form>
                    <p className="text-xs text-gray-400 mt-2">
                      Choose BUY or SELL transaction type. Date is optional and will default to today.
                    </p>
                  </div>
                  {/* Portfolio Holdings */}
                  <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center">Your Portfolio {deleting && <span className="ml-3 text-xs text-gray-400">Updating...</span>}</h2>
                    {portfolio.length > 0 ? (
                      <div className="space-y-4">
                        {portfolio.map((stock, index) => {
                          const gainLoss = (stock.price_change || 0) * (stock.shares_held || 0);
                          return (
                            <motion.div key={stock.ticker} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="p-6 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="flex items-center">
                                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mr-4">
                                    <span className="text-white font-bold">{stock.ticker.substring(0, 2)}</span>
                                  </div>
                                  <div>
                                    <h3 className="text-white font-semibold text-lg">{stock.ticker}</h3>
                                    <p className="text-gray-400 text-sm">{stock.shares_held} shares @ ${stock.average_buy_price?.toFixed(2) || '—'}</p>
                                    <p className="text-gray-400 text-xs">Current: ${stock.current_price?.toFixed(2) || '—'} | Change: {stock.price_change >= 0 ? '+' : ''}{stock.price_change?.toFixed(2)} ({stock.percent_change?.toFixed(2)}%)</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-white font-semibold text-lg">${stock.total_current_value?.toFixed(2) || 'N/A'}</p>
                                  <p className={`text-sm ${gainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>{gainLoss >= 0 ? '+' : ''}${gainLoss.toFixed(2)}</p>
                                </div>
                              </div>
                              <div className="mt-4 flex flex-wrap gap-3">
                                <button onClick={() => openSellForm(stock.ticker)} className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-lg text-white border border-white/20">{sellFormTicker === stock.ticker ? 'Cancel' : 'Sell'}</button>
                                <button onClick={() => deleteTicker(stock.ticker)} className="px-4 py-2 text-sm bg-red-600/20 hover:bg-red-600/30 rounded-lg text-red-300 border border-red-500/30">Delete</button>
                              </div>
                              {sellFormTicker === stock.ticker && (
                                <form onSubmit={(e) => sellStock(e, stock.ticker)} className="mt-4 grid md:grid-cols-5 gap-4 bg-black/20 p-4 rounded-lg">
                                  <input type="number" step="1" placeholder="Shares" value={sellForm.shares} onChange={(e) => setSellForm({ ...sellForm, shares: e.target.value })} className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm" required />
                                  <input type="number" step="0.01" placeholder="Sell Price" value={sellForm.sell_price} onChange={(e) => setSellForm({ ...sellForm, sell_price: e.target.value })} className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm" required />
                                  <input type="date" value={sellForm.date} onChange={(e) => setSellForm({ ...sellForm, date: e.target.value })} className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm" title="Transaction Date (optional)" />
                                  <button type="submit" disabled={loading} className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center">{loading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : 'Confirm Sell'}</button>
                                  <div className="text-xs text-gray-400 flex items-center">Date optional, defaults to today.</div>
                                </form>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <CurrencyDollarIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 text-lg mb-4">Your portfolio is empty</p>
                        <p className="text-gray-500 text-sm">Add your first stock using the form above</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-12 border border-white/10 text-center">
                  <UserIcon className="w-16 h-16 text-gray-600 mx-auto mb-6" />
                  <h2 className="text-2xl font-bold text-white mb-4">Login Required</h2>
                  <p className="text-gray-300 mb-8">
                    Please login to access your portfolio and track your investments.
                  </p>
                  <Link
                    to="/login"
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-300"
                  >
                    Login to Continue
                    <ArrowRightIcon className="w-5 h-5 ml-2" />
                  </Link>
                </div>
              )}
            </motion.div>
          )}

          {/* Transaction History Tab */}
          {activeTab === 'transactions' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {user ? (
                <>
                  {/* Add Transaction Form */}
                  <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                    <h2 className="text-2xl font-bold text-white mb-6">Add New Transaction</h2>
                    <form onSubmit={addTransaction} className="grid md:grid-cols-6 gap-4">
                      <input
                        type="text"
                        placeholder="Ticker (e.g., AAPL)"
                        value={newTransaction.ticker}
                        onChange={(e) => setNewTransaction({ ...newTransaction, ticker: e.target.value.toUpperCase() })}
                        className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <input
                        type="number"
                        step="1"
                        placeholder="Shares"
                        value={newTransaction.shares}
                        onChange={(e) => setNewTransaction({ ...newTransaction, shares: e.target.value })}
                        className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Price per Share"
                        value={newTransaction.price}
                        onChange={(e) => setNewTransaction({ ...newTransaction, price: e.target.value })}
                        className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <select
                        value={newTransaction.type}
                        onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value })}
                        className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="BUY">BUY</option>
                        <option value="SELL">SELL</option>
                      </select>
                      <input
                        type="date"
                        value={newTransaction.date}
                        onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                        className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        title="Transaction Date (optional - defaults to today)"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        disabled={loading}
                        className={`px-6 py-3 font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center ${
                          newTransaction.type === 'BUY' 
                            ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                            : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                        }`}
                      >
                        {loading ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                          <>Add {newTransaction.type}</>
                        )}
                      </motion.button>
                    </form>
                    <p className="text-xs text-gray-400 mt-2">
                      Add BUY or SELL transactions. For SELL transactions, you must have sufficient shares.
                    </p>
                  </div>

                  {/* Transaction History */}
                  <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                      <ClockIcon className="w-8 h-8 text-blue-400 mr-3" />
                      Transaction History
                    </h2>
                    {transactions.length > 0 ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-6 gap-4 text-gray-400 text-sm font-semibold border-b border-white/20 pb-2">
                          <div>Date</div>
                          <div>Type</div>
                          <div>Ticker</div>
                          <div>Shares</div>
                          <div>Price</div>
                          <div>Total</div>
                        </div>
                        {transactions.map((transaction, index) => (
                          <motion.div
                            key={transaction.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="grid grid-cols-6 gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                          >
                            <div className="text-white">
                              {new Date(transaction.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                              <div className="text-gray-400 text-xs">
                                {new Date(transaction.date).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                            <div>
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                transaction.type === 'BUY' 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : 'bg-red-500/20 text-red-400'
                              }`}>
                                {transaction.type}
                              </span>
                            </div>
                            <div className="text-white font-semibold">{transaction.ticker}</div>
                            <div className="text-white">{Math.abs(transaction.amount)}</div>
                            <div className="text-white">${Math.abs(transaction.price).toFixed(2)}</div>
                            <div className={`font-semibold ${
                              transaction.type === 'BUY' ? 'text-red-400' : 'text-green-400'
                            }`}>
                              {transaction.type === 'BUY' ? '-' : '+'}${transaction.total.toFixed(2)}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <ClockIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 text-lg mb-4">No transactions found</p>
                        <p className="text-gray-500 text-sm">Your transaction history will appear here once you start trading</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-12 border border-white/10 text-center">
                  <UserIcon className="w-16 h-16 text-gray-600 mx-auto mb-6" />
                  <h2 className="text-2xl font-bold text-white mb-4">Login Required</h2>
                  <p className="text-gray-300 mb-8">
                    Please login to view and add transactions.
                  </p>
                  <Link
                    to="/login"
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-300"
                  >
                    Login to Continue
                    <ArrowRightIcon className="w-5 h-5 ml-2" />
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Finance;
