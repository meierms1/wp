import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  UserIcon,
  DocumentTextIcon,
  PlusIcon,
  ArrowTopRightOnSquareIcon,
  CalendarIcon,
  BellIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [portfolioData, setPortfolioData] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalValue: 0,
    totalCost: 0,
    totalGainLoss: 0,
    gainLossPercent: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [portfolioResponse, transactionsResponse] = await Promise.all([
          axios.get('/api/portfolio/stocks'),
          axios.get('/api/transactions')
        ]);

        if (portfolioResponse.data.success) {
          const portfolio = portfolioResponse.data.portfolio || [];
          setPortfolioData(portfolio);
          calculateStats(portfolio);
        }

        if (transactionsResponse.data.success) {
          setTransactions(transactionsResponse.data.transactions.slice(0, 5) || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const calculateStats = (portfolio) => {
    if (!portfolio.length) {
      setStats({ totalValue: 0, totalCost: 0, totalGainLoss: 0, gainLossPercent: 0 });
      return;
    }

    const totalValue = portfolio.reduce((sum, stock) => sum + stock.current_value, 0);
    const totalCost = portfolio.reduce((sum, stock) => sum + (stock.shares * stock.purchase_price), 0);
    const totalGainLoss = totalValue - totalCost;
    const gainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

    setStats({ totalValue, totalCost, totalGainLoss, gainLossPercent });
  };

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

  const cardVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.5 }
    },
    hover: {
      scale: 1.02,
      transition: { duration: 0.2 }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <UserIcon className="w-24 h-24 text-gray-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Access Restricted</h2>
          <p className="text-gray-300 text-lg mb-8">Please login to view your dashboard.</p>
          <Link
            to="/login"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300"
          >
            Login to Continue
            <ArrowTopRightOnSquareIcon className="w-5 h-5 ml-2" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto"
        >
          {/* Welcome Header */}
          <motion.div variants={itemVariants} className="mb-12">
            <div className="flex items-center justify-between flex-wrap">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  Welcome back, {user.username}!
                </h1>
                <p className="text-xl text-gray-300">
                  Here's your portfolio overview for today
                </p>
              </div>
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/10 backdrop-blur-lg rounded-lg px-4 py-2 flex items-center"
                >
                  <CalendarIcon className="w-5 h-5 text-blue-400 mr-2" />
                  <span className="text-white">{new Date().toLocaleDateString()}</span>
                </motion.div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors"
                >
                  <BellIcon className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>

          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center py-20"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </motion.div>
          ) : (
            <>
              {/* Portfolio Stats */}
              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <motion.div variants={cardVariants} whileHover="hover" className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Total Portfolio Value</p>
                      <p className="text-3xl font-bold text-green-400">${stats.totalValue.toFixed(2)}</p>
                      <p className="text-gray-500 text-xs">Updated in real-time</p>
                    </div>
                    <div className="bg-green-500/20 p-3 rounded-lg">
                      <CurrencyDollarIcon className="w-8 h-8 text-green-400" />
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={cardVariants} whileHover="hover" className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Total Investment</p>
                      <p className="text-3xl font-bold text-blue-400">${stats.totalCost.toFixed(2)}</p>
                      <p className="text-gray-500 text-xs">Your total cost basis</p>
                    </div>
                    <div className="bg-blue-500/20 p-3 rounded-lg">
                      <DocumentTextIcon className="w-8 h-8 text-blue-400" />
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={cardVariants} whileHover="hover" className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Gain/Loss</p>
                      <p className={`text-3xl font-bold ${stats.totalGainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${stats.totalGainLoss.toFixed(2)}
                      </p>
                      <p className="text-gray-500 text-xs">Unrealized P&L</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stats.totalGainLoss >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                      {stats.totalGainLoss >= 0 ? 
                        <ArrowTrendingUpIcon className="w-8 h-8 text-green-400" /> :
                        <ArrowTrendingDownIcon className="w-8 h-8 text-red-400" />
                      }
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={cardVariants} whileHover="hover" className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Return Percentage</p>
                      <p className={`text-3xl font-bold ${stats.gainLossPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {stats.gainLossPercent.toFixed(2)}%
                      </p>
                      <p className="text-gray-500 text-xs">Overall performance</p>
                    </div>
                    <div className="bg-purple-500/20 p-3 rounded-lg">
                      <ChartBarIcon className="w-8 h-8 text-purple-400" />
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              <div className="grid lg:grid-cols-3 gap-8">
                {/* Portfolio Holdings */}
                <motion.div variants={itemVariants} className="lg:col-span-2">
                  <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-white">Portfolio Holdings</h2>
                      <Link
                        to="/finance"
                        className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        View All
                        <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-1" />
                      </Link>
                    </div>

                    {portfolioData.length > 0 ? (
                      <div className="space-y-4">
                        {portfolioData.slice(0, 5).map((stock, index) => (
                          <motion.div
                            key={stock.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                          >
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-4">
                                <span className="text-white font-bold text-sm">{stock.ticker.substring(0, 2)}</span>
                              </div>
                              <div>
                                <p className="text-white font-semibold">{stock.ticker}</p>
                                <p className="text-gray-400 text-sm">{stock.shares} shares</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-semibold">${stock.current_value.toFixed(2)}</p>
                              <p className={`text-sm ${stock.gain_loss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {stock.gain_loss >= 0 ? '+' : ''}${stock.gain_loss.toFixed(2)}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <ChartBarIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 text-lg mb-4">No stocks in your portfolio yet</p>
                        <Link
                          to="/finance"
                          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300"
                        >
                          <PlusIcon className="w-5 h-5 mr-2" />
                          Add Your First Stock
                        </Link>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Quick Actions & Recent Activity */}
                <motion.div variants={itemVariants} className="space-y-8">
                  {/* Quick Actions */}
                  <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
                    <div className="space-y-3">
                      <Link
                        to="/finance"
                        className="flex items-center p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-300 group"
                      >
                        <PlusIcon className="w-6 h-6 text-blue-400 mr-3" />
                        <div>
                          <p className="text-white font-semibold">Add Stock</p>
                          <p className="text-gray-400 text-sm">Track a new investment</p>
                        </div>
                        <ArrowTopRightOnSquareIcon className="w-4 h-4 text-gray-400 ml-auto group-hover:text-white transition-colors" />
                      </Link>

                      <Link
                        to="/finance"
                        className="flex items-center p-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg hover:from-green-500/30 hover:to-blue-500/30 transition-all duration-300 group"
                      >
                        <ChartBarIcon className="w-6 h-6 text-green-400 mr-3" />
                        <div>
                          <p className="text-white font-semibold">Market Analysis</p>
                          <p className="text-gray-400 text-sm">Research stocks</p>
                        </div>
                        <ArrowTopRightOnSquareIcon className="w-4 h-4 text-gray-400 ml-auto group-hover:text-white transition-colors" />
                      </Link>

                      <Link
                        to="/tools"
                        className="flex items-center p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300 group"
                      >
                        <DocumentTextIcon className="w-6 h-6 text-purple-400 mr-3" />
                        <div>
                          <p className="text-white font-semibold">Financial Tools</p>
                          <p className="text-gray-400 text-sm">Calculators & quiz</p>
                        </div>
                        <ArrowTopRightOnSquareIcon className="w-4 h-4 text-gray-400 ml-auto group-hover:text-white transition-colors" />
                      </Link>
                    </div>
                  </div>

                  {/* Recent Transactions */}
                  <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
                    {transactions.length > 0 ? (
                      <div className="space-y-3">
                        {transactions.map((transaction, index) => (
                          <motion.div
                            key={transaction.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                          >
                            <div>
                              <p className="text-white text-sm font-medium">
                                {transaction.type} {Math.abs(transaction.amount)} shares of {transaction.ticker}
                              </p>
                              <p className="text-gray-400 text-xs">
                                {new Date(transaction.date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })} • ${Math.abs(transaction.price).toFixed(2)}/share
                              </p>
                            </div>
                            <span className={`text-sm font-semibold ${transaction.type === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                              {transaction.type === 'BUY' ? '-' : '+'}${(Math.abs(transaction.price) * Math.abs(transaction.amount)).toFixed(2)}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <DocumentTextIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400">No recent transactions</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
