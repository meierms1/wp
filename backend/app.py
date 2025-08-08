#!/usr/bin/env python3
import os
import sys
import json
import random
import datetime

# Ensure project root is on sys.path for imports like 'backend.calculator', 'backend.finance'
PROJECT_ROOT = os.path.dirname(os.path.dirname(__file__))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.calculator import material, BaseConverter, GeneralConverter

# Import finance functions with error handling
try:
    from backend.finance import get_stock_data, get_stock_info, get_current_price
    FINANCE_AVAILABLE = True
except ImportError as e:
    print(f"Warning: Finance module import failed: {e}")
    FINANCE_AVAILABLE = False
    # Create dummy functions to prevent crashes
    def get_stock_data(*args, **kwargs):
        return [], []
    def get_stock_info(*args, **kwargs):
        return {}
    def get_current_price(*args, **kwargs):
        return 0.0

from flask import Flask, render_template, request, redirect, flash, url_for, abort, session, jsonify
from flask_login import LoginManager, login_required, UserMixin, login_user, logout_user, current_user
from flask_sqlalchemy import SQLAlchemy
from flask_caching import Cache
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField, IntegerField
from wtforms.validators import InputRequired, Length, ValidationError
from flask_mail import Mail, Message
from sqlalchemy.sql import func
from flask_cors import CORS
from jinja2 import ChoiceLoader, FileSystemLoader

# Paths
BACKEND_DIR = os.path.dirname(__file__)
BACKEND_TEMPLATES_DIR = os.path.join(BACKEND_DIR, 'templates')
STATIC_DIR = os.path.join(PROJECT_ROOT, 'static')
INSTANCE_DIR = os.path.join(PROJECT_ROOT, 'instance')
os.makedirs(INSTANCE_DIR, exist_ok=True)

# Initialize Flask app with explicit template/static/instance folders
app = Flask(
    __name__,
    template_folder=BACKEND_TEMPLATES_DIR,
    static_folder=STATIC_DIR,
    static_url_path='/static',
    instance_path=INSTANCE_DIR,
    instance_relative_config=True,
)
# Allow loading templates from backend templates folder
app.jinja_loader = ChoiceLoader([
    FileSystemLoader(BACKEND_TEMPLATES_DIR)
])

# Enable CORS for API routes (development)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"]}})

# Configuration
# Set up PostgreSQL database URL (with fallback to SQLite for local development)
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///database2.db')
# Handle PostgreSQL URL format for SQLAlchemy 2.x compatibility
if DATABASE_URL.startswith('postgres://'):
    DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)

# If using a relative SQLite path, make it absolute in an instance folder
if DATABASE_URL.startswith('sqlite:///') and '://' in DATABASE_URL:
    sqlite_path = DATABASE_URL.replace('sqlite:///', '', 1)
    if not os.path.isabs(sqlite_path):
        abs_sqlite_path = os.path.join(INSTANCE_DIR, os.path.basename(sqlite_path))
        DATABASE_URL = f"sqlite:///{abs_sqlite_path}"

app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', "secret-change-this-in-production")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # Disable SQLAlchemy event system

# Configure Flask-Caching for performance optimization
app.config['CACHE_TYPE'] = 'simple'  # Use simple in-memory cache
app.config['CACHE_DEFAULT_TIMEOUT'] = 300  # 5 minutes cache timeout

# Initialize extensions
db = SQLAlchemy(app)
cache = Cache(app)

# Email configuration
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 465))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'False').lower() == 'true'
app.config['MAIL_USE_SSL'] = os.getenv('MAIL_USE_SSL', 'True').lower() == 'true'
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME', 'm85830874@gmail.com')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD', 'wplpnspxnnnlgvwh')
mail = Mail(app)


# Login manager setup
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "signin"  # Fixed: should match the function name
login_manager.login_message = "Please log in to access this page."
login_manager.login_message_category = "info"

# Cached wrapper functions for expensive stock API calls
@cache.memoize(timeout=300)  # Cache for 5 minutes
def cached_get_current_price(ticker):
    """Cached version of get_current_price to reduce API calls"""
    return get_current_price(ticker)

@cache.memoize(timeout=600)  # Cache for 10 minutes (stock data changes less frequently)
def cached_get_stock_data(ticker, *args):
    """Cached version of get_stock_data to reduce API calls"""
    if len(args) == 1:
        return get_stock_data(ticker, args[0])
    elif len(args) == 2:
        return get_stock_data(ticker, args[0], args[1])
    else:
        return get_stock_data(ticker)

@cache.memoize(timeout=3600)  # Cache for 1 hour (company info rarely changes)
def cached_get_stock_info(ticker):
    """Cached version of get_stock_info to reduce API calls"""
    return get_stock_info(ticker)

# Load quiz questions from JSON file (robust path resolution)
QUESTIONS = []
try:
    candidate_paths = [
        os.path.join(PROJECT_ROOT, 'FIRE2.json'),
        os.path.join(BACKEND_DIR, 'FIRE2.json'),
        os.path.join(os.getcwd(), 'FIRE2.json')
    ]
    json_path = next((p for p in candidate_paths if os.path.exists(p)), None)
    if json_path:
        with open(json_path, 'r') as f:
            QUESTIONS = json.load(f)
        print(f"Loaded {len(QUESTIONS)} questions from {json_path}")
    else:
        print("Warning: FIRE2.json not found in expected locations")
except Exception as e:
    QUESTIONS = []
    print(f"Error loading FIRE2.json: {e}")

# Database Models
class User(db.Model, UserMixin):
    __tablename__ = 'user'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), nullable=False, unique=True)
    password = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(50), nullable=True)  # Increased length for emails
    
    # Relationship with proper back_populates
    transactions = db.relationship('Dashinfo', back_populates='user_ref', cascade='all, delete-orphan')

class Dashinfo(db.Model):
    __tablename__ = 'dashinfo'
    
    id = db.Column(db.Integer, primary_key=True)
    ticker = db.Column(db.String(10), nullable=False)
    price = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    type = db.Column(db.String(10), nullable=False)
    user = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # Fixed: changed user_id to user
    amount = db.Column(db.Integer)
    total = db.Column(db.Float)
    
    # Relationship with proper back_populates
    user_ref = db.relationship('User', back_populates='transactions', foreign_keys=[user])

@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))  # Updated for SQLAlchemy 2.x




class RegisterForm(FlaskForm):
    username = StringField(validators=[InputRequired(), Length(min=4, max=40)], render_kw={"placeholder":"Username"})
    password = StringField(validators=[InputRequired(), Length(min=4, max=40)], render_kw={"placeholder":"Password"})
    email = StringField(validators=[InputRequired(), Length(min=4, max=40)], render_kw={"placeholder":"email"})
    submit = SubmitField("Register")

    def validate_username(self, username):  # Fixed typo: was "validade_username"
        existing_user_name = User.query.filter_by(username=username.data).first()
        if existing_user_name:
            raise ValidationError("Username is already taken")

class LoginForm(FlaskForm):
    username = StringField(validators=[InputRequired(), Length(min=4, max=40)], render_kw={"placeholder":"Username"})
    password = StringField(validators=[InputRequired(), Length(min=4, max=40)], render_kw={"placeholder":"Password"})
    submit = SubmitField("Sign In")  # Fixed: was "Register"

class QuizForm(FlaskForm):
    num_questions = IntegerField('Number of Questions', validators=[InputRequired()], render_kw={'placeholder': 'Enter number (1-100)'})
    submit = SubmitField('Start Quiz')

@app.route("/sign-in/", methods=["GET", "POST"])
@app.route("/login/", methods=["GET", "POST"])  # Added alias for consistency
def signin():
    form = LoginForm()
    if form.validate_on_submit():
        try:
            user = User.query.filter_by(username=form.username.data).first()
            if user and user.password == form.password.data:
                login_user(user)
                flash('Logged in successfully!', 'success')
                
                # Check if user was trying to access a protected page
                next_page = request.args.get('next')
                if next_page:
                    return redirect(next_page)
                return redirect("/dashboard/")
            else:
                flash('Invalid username or password', 'error')
        except Exception as e:
            flash(f'Login error: {str(e)}', 'error')
            print(f"Login error: {e}")
    
    return render_template("/sign-in.html", form=form)

def user_on_mobile() -> bool:
    user_agent = request.headers.get("User-Agent")
    user_agent = user_agent.lower()
    mobile = ["android", "iphone"]
    if any(x in user_agent for x in mobile):
        return True
    return False

@app.route("/alamo/")
@app.route("/alamo")
def alamo():
    return redirect("https://github.com/solidsgroup/alamo/tree/flame")

@app.route("/classification")
@app.route("/classification/")
def classification():
    return redirect("https://github.com/meierms1/Supervised-Dimension-Reduction-For-Optical-Vapor-Sensing.git")

@app.route("/", methods=["GET","POST"])
def home():
    if request.method == "POST":
        name = request.form.get("name")
        email = request.form.get("email")
        message = request.form.get("message")
        msg = Message(subject = f"Mail From Flask page, from {name} ",body = f"name = {name} \n \n email = {email} \n\n {message}",sender = 'm85830874@gmail.com',recipients = ["m85830874@gmail.com", "meierms@icloud.com"])
        mail.send(msg)
        return render_template("about.html", success=True)
    return render_template("about.html")

@app.route("/about/", methods=["GET","POST"])
def about():
    if request.method == "POST":
        name = request.form.get("name")
        email = request.form.get("email")
        message = request.form.get("message")
        msg = Message(subject = f"Mail From Flask page, from {name} ",body = f"name = {name} \n \n email = {email} \n\n {message}",sender = 'm85830874@gmail.com',recipients = ["m85830874@gmail.com","meierms@icloud.com"])
        mail.send(msg)
        return render_template("about.html", success=True)
    return render_template("about.html")

@app.route("/resume/")
def resume():
    if (user_on_mobile()): return render_template("resume-mobile.html")
    return render_template("resume.html")

@app.route("/test-plot/")
def test_plot():
    """Test route to verify Plotly is working"""
    import datetime
    import math
    
    # Generate test data
    base_date = datetime.datetime.now() - datetime.timedelta(days=10)
    labels = [(base_date + datetime.timedelta(days=i)).strftime('%Y-%m-%d') for i in range(10)]
    prices = [100 + (i * 2) + (5 * math.sin(i)) for i in range(10)]
    
    info_data = ["Test Company", "Technology", "Software", 90.0, 120.0, 1.5, "This is a test company for debugging the plot functionality."]
    
    return render_template("finance.html", labels=labels, values=prices, stock_info=info_data, hide_block=False)

@app.route("/finance/", methods=["GET", "POST"])
def finance():
    if request.method == "POST":
        ticker = request.form.get("ticker_name")
        period = request.form.get("period")
        start = request.form.get("start_date")
        end = request.form.get("end_date")
        
        print(f"DEBUG: ticker={ticker}, period={period}, start={start}, end={end}")
        
        # Temporary fallback data for testing
        try:
            # Check if we have start and end dates
            if start and end and start.strip() and end.strip():
                print(f"DEBUG: Using date range {start} to {end}")
                label, price = cached_get_stock_data(ticker, start, end)
            elif period and period.strip():
                print(f"DEBUG: Using period {period}")
                label, price = cached_get_stock_data(ticker, period)
            else:
                print("DEBUG: Using default (max) period")
                label, price = cached_get_stock_data(ticker)

            print(f"DEBUG: Got {len(label)} labels and {len(price)} prices")
            
            # If no data returned, use sample data for testing
            if not label or not price or len(label) == 0:
                print("DEBUG: No data from API, using sample data")
                import datetime
                # Generate sample data for testing
                base_date = datetime.datetime.now() - datetime.timedelta(days=30)
                label = [(base_date + datetime.timedelta(days=i)).strftime('%Y-%m-%d') for i in range(30)]
                import math
                base_price = 150.0
                price = [base_price + (i * 0.5) + (10 * math.sin(i/5)) for i in range(30)]
            
            info_data = cached_get_stock_info(ticker)
            print(f"DEBUG: Got stock info: {info_data[0] if info_data else 'None'}")
            
            # If no info data, use sample info
            if not info_data or info_data[0] == "N/A":
                info_data = [f"{ticker.upper()} Company", "Technology", "Technology", 100.0, 200.0, 2.5, f"Sample company information for {ticker.upper()}"]

        except Exception as e:
            print(f"DEBUG: Error occurred: {e}")
            # Fallback to sample data
            import datetime
            base_date = datetime.datetime.now() - datetime.timedelta(days=30)
            label = [(base_date + datetime.timedelta(days=i)).strftime('%Y-%m-%d') for i in range(30)]
            import math
            base_price = 150.0
            price = [base_price + (i * 0.5) + (10 * math.sin(i/5)) for i in range(30)]
            info_data = [f"{ticker.upper()} Company", "Technology", "Technology", 100.0, 200.0, 2.5, f"Sample company information for {ticker.upper()}"]

        if (user_on_mobile()): 
            return render_template("finance-mobile.html", labels=label, values=price, stock_info=info_data, hide_block=False)
        return render_template("finance.html", labels=label, values=price, stock_info=info_data, hide_block=False)
    
    # GET request - show empty form
    label = []
    price = []
    info_data = ["-", "-", "-", "-", "-", "-", "-"]
    if (user_on_mobile()): 
        return render_template("finance-mobile.html", labels=label, values=price, stock_info=info_data, hide_block=True)
    return render_template("finance.html", labels=label, values=price, stock_info=info_data, hide_block=True)

@app.route("/projects/")
def projects():
    if (user_on_mobile()): return render_template("projects-mobile.html")
    return render_template("projects.html")

@app.route("/calculator/", methods=["GET","POST"])
def unittool():
    if (request.method == "POST"):
        try:
            e = -1; g = -1; k = -1; l = -1; v = -1
            first = request.form.get("first_property_name")
            second = request.form.get("second_property_name")
            if first == "young": e = float(request.form.get("first_property_value"))
            elif first == "shear": g = float(request.form.get("first_property_value"))
            elif first == "bulk": k = float(request.form.get("first_property_value"))
            elif first == "lame": l = float(request.form.get("first_property_value"))
            elif first == "poisson": v = float(request.form.get("first_property_value"))
            if second == "young": e = float(request.form.get("second_property_value"))
            elif second == "shear": g = float(request.form.get("second_property_value"))
            elif second == "bulk": k = float(request.form.get("second_property_value"))
            elif second == "lame": l = float(request.form.get("second_property_value"))
            elif second == "poisson": v = float(request.form.get("second_property_value"))
            calc = material(K = k, E = e, lame = l, G = g, Poisson = v)
            return render_template("tools.html", success_compute=True, E=round(calc.E, 3), G=round(calc.G, 3), K=round(calc.K, 3), L=round(calc.lame, 3), V=round(calc.Poisson, 3),value="Value")
        except:
            input_value = float(request.form.get("input_value"))
            input_unit = request.form.get("input_unit")
            output_unit = request.form.get("output_unit")
            if len(input_unit) > 50 or len(output_unit) > 50:
                flash("String is too long. Stopping for security")
                return render_template("tools.html", success_convert=True, value="String is too long")
            try:
                convert = GeneralConverter(input_value, input_unit, output_unit)
                output_value = convert.converted_value
                return render_template("tools.html", success_convert=True, value=str(output_value))
            except:
                return render_template("tools.html", success_convert=True, value="Incompatible units")
    return render_template("tools.html", value= "Value")



@app.route("/dashboard/", methods=["GET", "POST"])
@login_required
def dashboard():
    try:
        import numpy as np  # Only load when dashboard is accessed
        
        c_user = current_user.id
        print(f"DEBUG: Dashboard accessed by user {c_user}")
        
        if request.method == "POST":        
            if "add_buy" in request.form:
                try:
                    ticker = request.form.get("ticker_name")
                    price = float(request.form.get("ticker_price"))
                    date = request.form.get("action_date")
                    date = datetime.datetime.strptime(date, '%Y-%m-%d')
                    amount = int(request.form.get("ticker_amount"))
                    total = amount * price
                    user_id = c_user
                    new_transaction = Dashinfo(ticker=ticker, price=price, date=date, type="BUY", amount=amount, user=user_id, total=total)
                    db.session.add(new_transaction)
                    db.session.commit()
                    # Clear cache for this ticker to ensure fresh data
                    cache.delete_memoized(cached_get_current_price, ticker)
                    flash("Transaction added successfully!", "success")
                except Exception as e:
                    db.session.rollback()
                    flash(f"Error adding transaction: {str(e)}", "error")           
            elif "add_sell" in request.form:
                try:
                    ticker = request.form.get("ticker_name")
                    price = float(request.form.get("ticker_price"))
                    date = request.form.get("action_date")
                    date = datetime.datetime.strptime(date, '%Y-%m-%d')
                    amount = int(request.form.get("ticker_amount"))
                    user_id = c_user

                    current_stock_amount_buy = db.session.query(func.sum(Dashinfo.amount)).filter(Dashinfo.user==c_user, Dashinfo.ticker==ticker, Dashinfo.type=="BUY").scalar()
                    current_stock_amount_sell = db.session.query(func.sum(Dashinfo.amount)).filter(Dashinfo.user==c_user, Dashinfo.ticker==ticker, Dashinfo.type=="SELL").scalar()
                    if current_stock_amount_buy is None: current_stock_amount_buy = 0
                    if current_stock_amount_sell is None: current_stock_amount_sell = 0
                    current_ballance = current_stock_amount_buy - current_stock_amount_sell

                    if current_ballance < int(amount):
                        flash("You can not sell more than you have")
                    else:
                        new_transaction = Dashinfo(ticker=ticker, price=price*(-1), date=date, type="SELL", amount=amount*(-1), user=user_id)
                        db.session.add(new_transaction)
                        db.session.commit()
                        # Clear cache for this ticker to ensure fresh data
                        cache.delete_memoized(cached_get_current_price, ticker)
                        flash("Transaction added successfully!", "success")
                except Exception as e:
                    db.session.rollback()
                    flash(f"Error adding transaction: {str(e)}", "error")

            elif "remove_transaction" in request.form:
                try:
                    _id = request.form.get("remove_from_db")
                    user_id = c_user
                    transaction_id = Dashinfo.query.filter(Dashinfo.id==_id).first()

                    if transaction_id and transaction_id.user == user_id:
                        db.session.delete(transaction_id)
                        db.session.commit()
                        flash("Transaction removed successfully!", "success")
                    else:
                        flash("Declined: This transaction doesn't belong to you.", "error")
                except Exception as e:
                    db.session.rollback()
                    flash(f"Error removing transaction: {str(e)}", "error")

        # GET request or after POST - display dashboard
        data = Dashinfo.query.filter(Dashinfo.user==c_user).all()
        data_config=[]
        names = [] 
        for i in data:
            if (user_on_mobile()):
                data_config.append([i.id,i.ticker, abs(i.price), abs(i.amount), i.type])
            else:
                data_config.append([i.id,i.ticker, abs(i.price), i.date, abs(i.amount), i.type])
            if i.ticker not in names:
                names.append(i.ticker)

        # Optimize database queries - get all aggregated data in single queries per ticker
        sum_price = []
        local_changes = [] 
        
        # Pre-calculate aggregated data for all tickers to avoid N+1 query problem
        buy_aggregates = db.session.query(
            Dashinfo.ticker,
            func.sum(Dashinfo.price).label('total_price'),
            func.sum(Dashinfo.amount).label('total_amount')
        ).filter(
            Dashinfo.user==c_user, 
            Dashinfo.type=="BUY"
        ).group_by(Dashinfo.ticker).all()
        
        sell_aggregates = db.session.query(
            Dashinfo.ticker,
            func.sum(Dashinfo.price).label('total_price'),
            func.sum(Dashinfo.amount).label('total_amount')
        ).filter(
            Dashinfo.user==c_user, 
            Dashinfo.type=="SELL"
        ).group_by(Dashinfo.ticker).all()
        
        # Convert to dictionaries for O(1) lookup
        buy_data = {row.ticker: {'price': row.total_price or 0, 'amount': row.total_amount or 0} for row in buy_aggregates}
        sell_data = {row.ticker: {'price': row.total_price or 0, 'amount': row.total_amount or 0} for row in sell_aggregates}
        
        for ticker in names:
            # Get aggregated data from pre-calculated dictionaries
            p_buy = buy_data.get(ticker, {}).get('price', 0)
            p_sell = abs(sell_data.get(ticker, {}).get('price', 0))  # Convert back from negative
            a_buy = buy_data.get(ticker, {}).get('amount', 0)
            a_sell = abs(sell_data.get(ticker, {}).get('amount', 0))  # Convert back from negative
            
            value = (p_buy*a_buy - p_sell*a_sell)

            # Get individual transactions for average calculation (only for this ticker)
            ticker_data = [transaction for transaction in data if transaction.ticker == ticker]
            avg_prepare = [j.price for j in ticker_data if j.type == "BUY"]
            avg_prepare2 = [j.amount for j in ticker_data if j.type == "BUY"]

            if a_buy > 0:
                total_buy = sum([price*amount for price, amount in zip(avg_prepare, avg_prepare2)])
                price_avg = total_buy / a_buy
            else:
                price_avg = 0
     
            current_price = cached_get_current_price(ticker)
            current_cap = (a_buy - a_sell) * price_avg  
            current_market = (a_buy - a_sell) * current_price      

            sum_price.append(value)
            local_changes.append(current_market - current_cap)

        total_capital = round(sum(sum_price), 2)
        total_change = round(sum(local_changes),2)
        
        if total_change is None: total_change=0
        if total_capital is None or total_capital==0: total_capital=1
        
        if (user_on_mobile()): 
            return render_template('/dashboard-mobile.html', data_table=data_config, tickers_list=names, sum_price=sum_price, local_changes=local_changes, total_capital=total_capital, total_change=total_change)
        return render_template('/dashboard.html', data_table=data_config, tickers_list=names, sum_price=sum_price, local_changes=local_changes, total_capital=total_capital, total_change=total_change)
    
    except Exception as e:
        flash(f"Dashboard error: {str(e)}", "error")
        print(f"Dashboard error: {e}")
        return redirect("/about/")

@app.route("/register/", methods=["GET", "POST"])
def signup():
    form = RegisterForm()
    if form.validate_on_submit():
        try:
            # Check if user already exists
            existing_user = User.query.filter_by(username=form.username.data).first()
            if existing_user:
                flash('Username already exists. Please choose a different one.', 'error')
                return render_template('/register.html', form=form)
            
            # Check if email already exists
            existing_email = User.query.filter_by(email=form.email.data).first()
            if existing_email:
                flash('Email already registered. Please use a different email.', 'error')
                return render_template('/register.html', form=form)
            
            # Create new user
            new_user = User(username=form.username.data, password=form.password.data, email=form.email.data)
            db.session.add(new_user)
            db.session.commit()
            flash('Registration successful! Please sign in.', 'success')
            return redirect("/sign-in/")
            
        except Exception as e:
            db.session.rollback()
            flash(f'Registration failed: {str(e)}', 'error')
            print(f"Registration error: {e}")
    
    # If form validation fails, show errors
    for field, errors in form.errors.items():
        for error in errors:
            flash(f'{field}: {error}', 'error')
    
    return render_template('/register.html', form=form)

@app.route("/Logout/")
@login_required
def logout():
    logout_user()
    return redirect("/about/")

# Quiz Routes
@app.route('/quiz/', methods=['GET', 'POST'])
def quiz():
    form = QuizForm()
    if form.validate_on_submit():
        n = form.num_questions.data
        if n > 100:
            flash('Please select a number of questions between 1 and 100.', 'error')
            return render_template('firequiz.html', form=form)
        if n < 1 or n > len(QUESTIONS):
            flash(f'Please select between 1 and 100 questions.', 'error')
            return render_template('firequiz.html', form=form)
        session['quiz_questions'] = random.sample(range(len(QUESTIONS)), n)
        session['quiz_current'] = 0
        session['quiz_score'] = 0
        return redirect(url_for('quiz_question'))
    return render_template('firequiz.html', form=form)

@app.route('/quiz_question')
def quiz_question():
    if 'quiz_questions' not in session or session['quiz_current'] >= len(session['quiz_questions']):
        return redirect(url_for('quiz_result'))
    q_index = session['quiz_questions'][session['quiz_current']]
    question = QUESTIONS[q_index]
    return render_template('quiz_question.html', question=question,
                          q_num=session['quiz_current'] + 1,
                          total=len(session['quiz_questions']))

@app.route('/quiz_submit', methods=['POST'])
def quiz_submit():
    if 'quiz_questions' not in session:
        flash('Quiz session expired.', 'error')
        return redirect(url_for('quiz'))
    answer = request.form.get('answer')
    if not answer:
        flash('Please select an answer.', 'error')
        return redirect(url_for('quiz_question'))
    q_index = session['quiz_questions'][session['quiz_current']]
    question = QUESTIONS[q_index]
    correct = answer == question['correct_answer']
    if correct:
        session['quiz_score'] += 1
    session['quiz_feedback'] = {
        'correct': correct,
        'explanation': question['explanation_long'] if not correct else '',
        'correct_answer': question['correct_answer'] if not correct else '',
        'question_text': question['question_text']
    }
    return redirect(url_for('quiz_feedback'))

@app.route('/quiz_feedback')
def quiz_feedback():
    if 'quiz_feedback' not in session:
        flash('No feedback available.', 'error')
        return redirect(url_for('quiz'))
    feedback = session['quiz_feedback']
    return render_template('quiz_feedback.html', feedback=feedback)

@app.route('/quiz_next', methods=['POST'])
def quiz_next():
    if 'quiz_questions' not in session:
        flash('Quiz session expired.', 'error')
        return redirect(url_for('quiz'))
    session['quiz_current'] += 1
    return redirect(url_for('quiz_question') if session['quiz_current'] < len(session['quiz_questions']) else url_for('quiz_result'))

@app.route('/quiz_result')
def quiz_result():
    if 'quiz_score' not in session:
        flash('No quiz results available.', 'error')
        return redirect(url_for('quiz'))
    score = session['quiz_score']
    total = len(session['quiz_questions'])
    session.pop('quiz_questions', None)
    session.pop('quiz_current', None)
    session.pop('quiz_score', None)
    session.pop('quiz_feedback', None)
    return render_template('quiz_result.html', score=score, total=total)

# React Quiz API endpoints
@app.route('/api/quiz/questions', methods=['GET'])
def api_get_quiz_questions():
    try:
        num_questions = request.args.get('count', 10, type=int)
        available_questions = len(QUESTIONS)
        if num_questions > available_questions:
            num_questions = available_questions
        pool = list(QUESTIONS)
        picked = (
            random.sample(pool, num_questions)
            if num_questions < available_questions else pool
        )
        # Return copies with transient IDs
        selected_questions = [
            {**q, 'id': i}
            for i, q in enumerate(picked)
        ]
        return jsonify({
            'success': True,
            'questions': selected_questions,
            'total_available': available_questions
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/quiz/submit', methods=['POST'])
def api_submit_quiz():
    try:
        data = request.get_json() or {}
        answers = data.get('answers', {})
        quiz_questions = data.get('questions', [])
        score = 0
        total_questions = len(quiz_questions)
        for question in quiz_questions:
            qid = str(question.get('id'))
            user_answer = answers.get(qid)
            if user_answer == question.get('correct_answer'):
                score += 1
        percentage = round((score / total_questions * 100), 1) if total_questions > 0 else 0
        return jsonify({'success': True, 'score': score, 'total': total_questions, 'percentage': percentage})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# Initialize database tables
def init_db():
    """Initialize database tables"""
    try:
        with app.app_context():
            # Test database connection
            with db.engine.connect() as conn:
                conn.execute(db.text('SELECT 1'))
            db.create_all()
            print("Database tables created successfully")
            print(f"Database URL: {app.config['SQLALCHEMY_DATABASE_URI']}")
    except Exception as e:
        print(f"Database initialization error: {e}")
        print("This might be due to ephemeral storage in cloud deployment.")
        print("Consider using a persistent database service like Neon, PlanetScale, or Railway.")

if __name__ == "__main__":
    # Initialize database
    init_db()
    
    # Use environment variables for production configuration
    debug_mode = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    port = int(os.getenv('PORT', 5000))
    host = os.getenv('HOST', '0.0.0.0')
    
    app.run(debug=debug_mode, port=port, host=host)
