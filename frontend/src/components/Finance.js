import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../contexts/AuthContext';
import Plot from 'react-plotly.js';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  ChartBarIcon, 
  PlusIcon, 
  TrendingUpIcon, 
  TrendingDownIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  EyeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const Finance = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [portfolio, setPortfolio] = useState([]);
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [addStockForm, setAddStockForm] = useState({ ticker: '', shares: '', price: '' });
  const [searchForm, setSearchForm] = useState({ ticker: '', period: '1y' });

  useEffect(() => {
    if (user) {
      fetchPortfolio();
    }
  }, [user]);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/portfolio/stocks');
      setPortfolio(response.data.portfolio || []);
    } catch (error) {
      toast.error('Failed to fetch portfolio');
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStockData = async (ticker, period = '1y') => {
    try {
      setLoading(true);
      const response = await axios.post('/api/finance/stock-data', {
        ticker_name: ticker,
        period: [period]
      });
      
      if (response.data.success) {
        setStockData(response.data.data);
        toast.success(`Stock data loaded for ${ticker}`);
      } else {
        toast.error(response.data.message || 'Failed to fetch stock data');
      }
    } catch (error) {
      toast.error('Failed to fetch stock data');
      console.error('Error fetching stock data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addStock = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to add stocks');
      return;
    }

    try {
      const response = await axios.post('/api/portfolio/stocks', {
        ticker: addStockForm.ticker.toUpperCase(),
        shares: parseFloat(addStockForm.shares),
        purchase_price: parseFloat(addStockForm.price)
      });

      if (response.data.success) {
        toast.success('Stock added to portfolio');
        setAddStockForm({ ticker: '', shares: '', price: '' });
        fetchPortfolio();
      } else {
        toast.error(response.data.message || 'Failed to add stock');
      }
    } catch (error) {
      toast.error('Failed to add stock');
      console.error('Error adding stock:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchForm.ticker) {
      toast.error('Please enter a ticker symbol');
      return;
    }
    await fetchStockData(searchForm.ticker, searchForm.period);
  };

  const calculatePortfolioStats = () => {
    if (!portfolio.length) return { totalValue: 0, totalCost: 0, totalGainLoss: 0, gainLossPercent: 0 };
    
    const totalValue = portfolio.reduce((sum, stock) => sum + stock.current_value, 0);
    const totalCost = portfolio.reduce((sum, stock) => sum + (stock.shares * stock.purchase_price), 0);
    const totalGainLoss = totalValue - totalCost;
    const gainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

    return { totalValue, totalCost, totalGainLoss, gainLossPercent };
  };

  const stats = calculatePortfolioStats();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-6">
              Finance Dashboard
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Track your investments, analyze market trends, and make informed financial decisions.
            </p>
          </motion.div>

          {/* Tab Navigation */}
          <motion.div variants={itemVariants} className="flex flex-wrap justify-center mb-8">
            {[
              { id: 'dashboard', label: 'Portfolio', icon: ChartBarIcon },
              { id: 'search', label: 'Stock Search', icon: EyeIcon },
              { id: 'add', label: 'Add Stock', icon: PlusIcon }
            ].map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-3 mx-2 mb-2 rounded-full font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.label}
              </motion.button>
            ))}
          </motion.div>

          <AnimatePresence mode="wait">
            {/* Portfolio Dashboard */}
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-8"
              >
                {user ? (
                  <>
                    {/* Portfolio Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-400 text-sm">Total Value</p>
                            <p className="text-2xl font-bold text-green-400">${stats.totalValue.toFixed(2)}</p>
                          </div>
                          <CurrencyDollarIcon className="w-8 h-8 text-green-400" />
                        </div>
                      </motion.div>

                      <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-400 text-sm">Total Cost</p>
                            <p className="text-2xl font-bold text-blue-400">${stats.totalCost.toFixed(2)}</p>
                          </div>
                          <DocumentTextIcon className="w-8 h-8 text-blue-400" />
                        </div>
                      </motion.div>

                      <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-400 text-sm">Gain/Loss</p>
                            <p className={`text-2xl font-bold ${stats.totalGainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              ${stats.totalGainLoss.toFixed(2)}
                            </p>
                          </div>
                          {stats.totalGainLoss >= 0 ? 
                            <TrendingUpIcon className="w-8 h-8 text-green-400" /> :
                            <TrendingDownIcon className="w-8 h-8 text-red-400" />
                          }
                        </div>
                      </motion.div>

                      <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-400 text-sm">Return %</p>
                            <p className={`text-2xl font-bold ${stats.gainLossPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {stats.gainLossPercent.toFixed(2)}%
                            </p>
                          </div>
                          <ChartBarIcon className="w-8 h-8 text-purple-400" />
                        </div>
                      </motion.div>
                    </div>

                    {/* Portfolio Holdings */}
                    <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white">Portfolio Holdings</h2>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={fetchPortfolio}
                          disabled={loading}
                          className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                        >
                          <ArrowPathIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                          Refresh
                        </motion.button>
                      </div>

                      {portfolio.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-gray-700">
                                <th className="text-left py-3 px-4 text-gray-300">Ticker</th>
                                <th className="text-left py-3 px-4 text-gray-300">Shares</th>
                                <th className="text-left py-3 px-4 text-gray-300">Purchase Price</th>
                                <th className="text-left py-3 px-4 text-gray-300">Current Price</th>
                                <th className="text-left py-3 px-4 text-gray-300">Current Value</th>
                                <th className="text-left py-3 px-4 text-gray-300">Gain/Loss</th>
                              </tr>
                            </thead>
                            <tbody>
                              {portfolio.map((stock, index) => (
                                <motion.tr
                                  key={stock.id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  className="border-b border-gray-800 hover:bg-white/5"
                                >
                                  <td className="py-3 px-4 text-white font-semibold">{stock.ticker}</td>
                                  <td className="py-3 px-4 text-gray-300">{stock.shares}</td>
                                  <td className="py-3 px-4 text-gray-300">${stock.purchase_price.toFixed(2)}</td>
                                  <td className="py-3 px-4 text-gray-300">${stock.current_price.toFixed(2)}</td>
                                  <td className="py-3 px-4 text-gray-300">${stock.current_value.toFixed(2)}</td>
                                  <td className={`py-3 px-4 font-semibold ${stock.gain_loss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    ${stock.gain_loss.toFixed(2)}
                                  </td>
                                </motion.tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <ChartBarIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-400 text-lg">No stocks in your portfolio yet</p>
                          <p className="text-gray-500">Add some stocks to get started!</p>
                        </div>
                      )}
                    </motion.div>
                  </>
                ) : (
                  <motion.div variants={itemVariants} className="text-center py-20">
                    <CurrencyDollarIcon className="w-24 h-24 text-gray-600 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold text-white mb-4">Login Required</h2>
                    <p className="text-gray-300 text-lg">Please login to view your portfolio and track your investments.</p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Stock Search */}
            {activeTab === 'search' && (
              <motion.div
                key="search"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-8"
              >
                <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                  <h2 className="text-2xl font-bold text-white mb-6">Stock Search & Analysis</h2>
                  <form onSubmit={handleSearch} className="flex flex-wrap gap-4 mb-6">
                    <input
                      type="text"
                      placeholder="Enter ticker symbol (e.g., AAPL)"
                      value={searchForm.ticker}
                      onChange={(e) => setSearchForm({ ...searchForm, ticker: e.target.value.toUpperCase() })}
                      className="flex-1 min-w-64 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <select
                      value={searchForm.period}
                      onChange={(e) => setSearchForm({ ...searchForm, period: e.target.value })}
                      className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="1mo">1 Month</option>
                      <option value="3mo">3 Months</option>
                      <option value="6mo">6 Months</option>
                      <option value="1y">1 Year</option>
                      <option value="2y">2 Years</option>
                      <option value="5y">5 Years</option>
                      <option value="max">Max</option>
                    </select>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={loading}
                      className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-lg transition-all duration-300 disabled:opacity-50"
                    >
                      {loading ? 'Loading...' : 'Search'}
                    </motion.button>
                  </form>

                  {stockData && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      {/* Stock Info */}
                      {stockData.stock_info && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white/5 rounded-lg p-4">
                            <p className="text-gray-400 text-sm">Company</p>
                            <p className="text-white font-semibold">{stockData.stock_info.longName || stockData.ticker}</p>
                          </div>
                          <div className="bg-white/5 rounded-lg p-4">
                            <p className="text-gray-400 text-sm">Sector</p>
                            <p className="text-white font-semibold">{stockData.stock_info.sector || 'N/A'}</p>
                          </div>
                          <div className="bg-white/5 rounded-lg p-4">
                            <p className="text-gray-400 text-sm">Market Cap</p>
                            <p className="text-white font-semibold">
                              {stockData.stock_info.marketCap ? 
                                `$${(stockData.stock_info.marketCap / 1e9).toFixed(2)}B` : 'N/A'}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Price Chart */}
                      {stockData.labels && stockData.values && (
                        <div className="bg-white/5 rounded-lg p-4">
                          <Plot
                            data={[{
                              x: stockData.labels,
                              y: stockData.values,
                              type: 'scatter',
                              mode: 'lines',
                              line: { color: '#3B82F6', width: 2 },
                              fill: 'tonexty',
                              fillcolor: 'rgba(59, 130, 246, 0.1)'
                            }]}
                            layout={{
                              title: `${stockData.ticker} Price Chart`,
                              titlefont: { color: 'white' },
                              paper_bgcolor: 'transparent',
                              plot_bgcolor: 'transparent',
                              font: { color: 'white' },
                              xaxis: { 
                                gridcolor: 'rgba(255,255,255,0.1)',
                                color: 'white'
                              },
                              yaxis: { 
                                gridcolor: 'rgba(255,255,255,0.1)',
                                color: 'white'
                              },
                              margin: { t: 50, r: 30, b: 50, l: 60 }
                            }}
                            style={{ width: '100%', height: '400px' }}
                            config={{ displayModeBar: false }}
                          />
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            )}

            {/* Add Stock */}
            {activeTab === 'add' && (
              <motion.div
                key="add"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <motion.div variants={itemVariants} className="max-w-2xl mx-auto bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                  <h2 className="text-2xl font-bold text-white mb-6">Add Stock to Portfolio</h2>
                  
                  {user ? (
                    <form onSubmit={addStock} className="space-y-6">
                      <div>
                        <label className="block text-gray-300 mb-2">Ticker Symbol</label>
                        <input
                          type="text"
                          placeholder="e.g., AAPL"
                          value={addStockForm.ticker}
                          onChange={(e) => setAddStockForm({ ...addStockForm, ticker: e.target.value.toUpperCase() })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-300 mb-2">Number of Shares</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 10"
                          value={addStockForm.shares}
                          onChange={(e) => setAddStockForm({ ...addStockForm, shares: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-300 mb-2">Purchase Price per Share</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 150.00"
                          value={addStockForm.price}
                          onChange={(e) => setAddStockForm({ ...addStockForm, price: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full py-4 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold rounded-lg transition-all duration-300"
                      >
                        Add to Portfolio
                      </motion.button>
                    </form>
                  ) : (
                    <div className="text-center py-8">
                      <CurrencyDollarIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">Login Required</h3>
                      <p className="text-gray-300">Please login to add stocks to your portfolio.</p>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default Finance;
