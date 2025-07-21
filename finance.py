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
        # Add small delay to avoid rate limiting
        time.sleep(0.1)
        
        if start is not None and end is not None: 
            df = yf.download(stock, start=start, end=end, progress=False, timeout=10)
        else:
            df = yf.download(stock, period=period, progress=False, timeout=10)
        
        if df.empty:
            print(f"Warning: No data found for ticker {stock}")
            return [], []
        
        df["Date"] = df.index.strftime('%Y-%m-%d')
        labels = df["Date"].tolist()
        price = df["Close"].tolist()
        return labels, price
    
    except Exception as e:
        print(f"Error fetching stock data for {stock}: {e}")
        # Return sample data for development/testing
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
        # Add delay to avoid rate limiting
        time.sleep(0.1)
        
        ticker = yf.Ticker(stock)
        
        # Try to get info with timeout
        info = ticker.info
        
        if not info or len(info) < 5:
            print(f"Warning: Limited information available for ticker {stock}")
            return [f"{stock.upper()}", "Technology", "N/A", 0.0, 0.0, 0.0, f"Company information for {stock.upper()}"]
        
        # Get dividend yield safely
        dividend_yield = 0.0
        if 'trailingAnnualDividendYield' in info and info['trailingAnnualDividendYield']:
            dividend_yield = info['trailingAnnualDividendYield'] * 100
        
        # Build company info with safe defaults
        company_info = [
            info.get("longName", f"{stock.upper()} Company"),
            info.get("industry", "N/A"),
            info.get("sector", "N/A"),
            info.get("fiftyTwoWeekLow", 0.0),
            info.get("fiftyTwoWeekHigh", 0.0),
            dividend_yield,
            info.get("longBusinessSummary", f"Company information for {stock.upper()}")
        ]
        
        return company_info
    
    except Exception as e:
        print(f"Error fetching stock info for {stock}: {e}")
        # Return fallback data for development/testing
        return [f"{stock.upper()}", "N/A", "N/A", 0.0, 0.0, 0.0, f"Unable to fetch information for {stock.upper()} due to API limitations"]


def get_current_price(stock):
    """
    Get the current/latest price for a given ticker symbol.
    
    Args:
        stock (str): Stock ticker symbol
    
    Returns:
        float: Current stock price
    """
    try:
        # Add delay to avoid rate limiting
        time.sleep(0.1)
        
        ticker = yf.Ticker(stock)
        # Get only last 2 days of data to ensure we have recent data
        data = ticker.history(period='2d', timeout=10)
        
        if data.empty:
            print(f"Warning: No price data found for ticker {stock}")
            return 0.0
        
        return float(data["Close"].iloc[-1])
    
    except Exception as e:
        print(f"Error fetching current price for {stock}: {e}")
        return 0.0


# Alternative function for testing with mock data
def get_sample_data():
    """
    Returns sample stock data for testing when API is unavailable.
    """
    import datetime
    
    # Generate sample dates for the last 30 days
    end_date = datetime.datetime.now()
    dates = []
    prices = []
    
    base_price = 150.0
    for i in range(30):
        date = end_date - datetime.timedelta(days=29-i)
        dates.append(date.strftime('%Y-%m-%d'))
        # Generate sample price with some variation
        price_variation = (i * 0.5) + (5 * math.sin(i/3))
        prices.append(base_price + price_variation)
    
    return dates, prices
