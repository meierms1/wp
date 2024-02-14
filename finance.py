import math
import datetime as dt
import numpy as np
import yfinance as yf


def get_stock_data(stock, period="max", start=None, end=None):
    if start is not None and end is not None: 
        df=yf.download(stock, start=start, end=end)
    else:
        df = yf.download(stock, period=period)
    df["Date"] = df.index.strftime('%Y-%m-%d')
    labels = df["Date"].tolist()
    price = df["Close"].tolist()
    return labels, price

def get_stock_info(stock):
    df_ = yf.Ticker(stock)
    print(np.mean(df_.dividends))
    print(df_.info["longName"])
    if 'trailingAnnualDividendYield' in df_.info.keys():
        v = df_.info['trailingAnnualDividendYield']*100
    else:
        v = 0.0
    company_info = [df_.info["longName"], df_.info["industry"], df_.info["sector"], df_.info["fiftyTwoWeekLow"], df_.info["fiftyTwoWeekHigh"], v, df_.info["longBusinessSummary"]]
    return company_info 
    
def get_current_price(stock):
    df = yf.Ticker(stock)
    data = df.history()
    return float(data["Close"].iloc[-1])
