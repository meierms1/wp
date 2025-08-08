import math
import datetime as dt
import time
import numpy as np
import yfinance as yf


def get_stock_data(stock, period="max", start=None, end=None):
    """
    Get stock price data for a given ticker symbol.
    
    Args:
        stock (str): Stock ticker symbol
        period (str): Time period (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)
        start (str): Start date in YYYY-MM-DD format
        end (str): End date in YYYY-MM-DD format
    
    Returns:
        tuple: (labels, prices) - lists of dates and closing prices
    """
    try:
        if start is not None and end is not None: 
            df = yf.download(stock, start=start, end=end, auto_adjust=True, progress=False)
        else:
            df = yf.download(stock, period=period, auto_adjust=True, progress=False)
        
        if df.empty:
            print(f"Warning: No data found for ticker {stock}")
            return [], []
        
        # Build labels and prices safely (pandas Series of floats)
        df["Date"] = df.index.strftime('%Y-%m-%d')
        df["CloseP"] = df.Close
        labels = df["Date"].tolist()
        print("here")
        print(df["Close"])
        prices = df["CloseP"].astype(float).tolist()
        
        return labels, prices
    
    except Exception as e:
        print(f"Error fetching stock data for {stock}: {e}")
        return [], []

def get_stock_info(stock):
    """
    Get company information for a given ticker symbol.
    
    Args:
        stock (str): Stock ticker symbol
    
    Returns:
        list: Company information [name, industry, sector, 52w_low, 52w_high, dividend_yield, description]
    """
    try:
        ticker = yf.Ticker(stock)
        info = {}
        # Prefer get_info() on newer yfinance, fallback to .info
        try:
            info = ticker.get_info()
        except Exception:
            info = getattr(ticker, 'info', {}) or {}
        
        if not info:
            print(f"Warning: No information found for ticker {stock}")
            return [f"{stock.upper()}", "N/A", "N/A", 0.0, 0.0, 0.0, f"No information available for {stock.upper()}"]
        
        # Get dividend yield safely
        dividend_yield = 0.0
        dy = info.get('trailingAnnualDividendYield') or info.get('dividendYield')
        if dy is not None:
            try:
                dividend_yield = float(dy) * (100.0 if dy <= 1 else 1.0)
            except Exception:
                dividend_yield = 0.0
        
        # Build company info with safe defaults
        company_info = [
            info.get("longName") or info.get("shortName") or f"{stock.upper()} Company",
            info.get("industry", "N/A"),
            info.get("sector", "N/A"),
            float(info.get("fiftyTwoWeekLow", 0.0) or 0.0),
            float(info.get("fiftyTwoWeekHigh", 0.0) or 0.0),
            dividend_yield,
            info.get("longBusinessSummary", f"No description available for {stock.upper()}")
        ]
        
        return company_info
    
    except Exception as e:
        print(f"Error fetching stock info for {stock}: {e}")
        return [f"{stock.upper()}", "N/A", "N/A", 0.0, 0.0, 0.0, f"Error fetching information for {stock.upper()}"] 
    

def get_current_price(stock):
    """
    Get the current/latest price for a given ticker symbol.
    
    Args:
        stock (str): Stock ticker symbol
    
    Returns:
        float: Current stock price
    """
    try:
        ticker = yf.Ticker(stock)
        # Get only last 2 days of data to ensure we have recent data
        data = ticker.history(period='2d', auto_adjust=True)
        
        if data.empty:
            print(f"Warning: No price data found for ticker {stock}")
            return 0.0
        
        return float(data["Close"].iloc[-1])
    
    except Exception as e:
        print(f"Error fetching current price for {stock}: {e}")
        return 0.0
