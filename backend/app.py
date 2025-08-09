#!/usr/bin/env python3
import os
import sys
import json
import random
import datetime
import time

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

from flask import Flask, request, redirect, abort, session, jsonify, send_from_directory
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
from sqlalchemy import text  # Added for raw SQL text usage
from werkzeug.security import generate_password_hash, check_password_hash

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
# Allow loading templates from backend and root templates folders
ROOT_TEMPLATES_DIR = os.path.join(PROJECT_ROOT, 'templates')
app.jinja_loader = ChoiceLoader([
    FileSystemLoader(BACKEND_TEMPLATES_DIR),
    FileSystemLoader(ROOT_TEMPLATES_DIR),
])

# Enable CORS for API routes (production-ready)
cors_origins = os.getenv('CORS_ORIGINS', 'https://meierms.com').split(',')
CORS(app, resources={
    r"/api/*": {
        "origins": cors_origins,
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
}, supports_credentials=True)

# Configuration
# Set up PostgreSQL database URL (with fallback to SQLite for local development)
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///database2.db')

# Handle PostgreSQL URL format for SQLAlchemy 2.x compatibility
if DATABASE_URL.startswith('postgres://'):
    DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)

# For Neon and other PostgreSQL services, ensure SSL is configured properly
if DATABASE_URL.startswith('postgresql://') and 'sslmode' not in DATABASE_URL:
    # Add SSL mode for production PostgreSQL connections
    separator = '&' if '?' in DATABASE_URL else '?'
    DATABASE_URL += f"{separator}sslmode=require"

# If using a relative SQLite path, make it absolute in an instance folder
if DATABASE_URL.startswith('sqlite:///') and '://' in DATABASE_URL:
    sqlite_path = DATABASE_URL.replace('sqlite:///', '', 1)
    if not os.path.isabs(sqlite_path):
        abs_sqlite_path = os.path.join(INSTANCE_DIR, os.path.basename(sqlite_path))
        DATABASE_URL = f"sqlite:///{abs_sqlite_path}"

app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', "secret-change-this-in-production")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # Disable SQLAlchemy event system
# Session / cookie settings for production
is_production = os.getenv('FLASK_ENV', 'production') == 'production'
app.config.setdefault('SESSION_COOKIE_SAMESITE', 'None' if not is_production else 'Lax')
app.config.setdefault('SESSION_COOKIE_SECURE', is_production)  # True in production HTTPS
app.config.setdefault('SESSION_COOKIE_HTTPONLY', True)  # Security: prevent XSS

# Configure Flask-Caching for production performance
cache_config = {
    'CACHE_TYPE': os.getenv('CACHE_TYPE', 'simple'),
    'CACHE_DEFAULT_TIMEOUT': int(os.getenv('CACHE_TIMEOUT', '300')),
}
# Use Redis in production if available
if os.getenv('REDIS_URL'):
    cache_config.update({
        'CACHE_TYPE': 'redis',
        'CACHE_REDIS_URL': os.getenv('REDIS_URL'),
    })
app.config.update(cache_config)

# Initialize extensions
db = SQLAlchemy(app)
cache = Cache(app)

# Add security headers for production
@app.after_request
def add_security_headers(response):
    """Add security headers for production deployment"""
    if is_production:
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        # Content Security Policy
        csp = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.plot.ly; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com; "
            "img-src 'self' data: https:; "
            "connect-src 'self' https://api.polygon.io https://query1.finance.yahoo.com; "
            "frame-ancestors 'none';"
        )
        response.headers['Content-Security-Policy'] = csp
    
    # Cache headers for static assets
    if request.endpoint and 'static' in request.endpoint:
        response.headers['Cache-Control'] = 'public, max-age=31536000'  # 1 year
    elif request.endpoint in ['serve_react_css', 'serve_react_js', 'serve_react_media']:
        response.headers['Cache-Control'] = 'public, max-age=31536000'  # 1 year
    
    return response

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
login_manager.login_view = None  # Using custom unauthorized handler + JSON APIs

# Provide JSON instead of redirect for unauthorized access (API friendly)
@login_manager.unauthorized_handler
def unauthorized_handler():
    # If request expects JSON (API route), return 401 JSON; else redirect to React SPA
    if request.path.startswith('/api/') or request.is_json:
        return jsonify({'success': False, 'message': 'Authentication required'}), 401
    return redirect('/')

# Mobile user-agent detection helper (restored)
def user_on_mobile():
    ua = (request.headers.get('User-Agent') or '').lower()
    return any(token in ua for token in ('iphone', 'android', 'ipad', 'mobile'))

# Cached wrapper functions for expensive stock API calls
@cache.memoize(timeout=300)  # Cache for 5 minutes
def cached_get_current_price(ticker):
    """Cached version of get_current_price to reduce API calls"""
    return get_current_price(ticker)

@cache.memoize(timeout=600)  # Cache for 10 minutes (stock data changes less frequently)
def cached_get_stock_data(ticker, *args):
    """Cached version of get_stock_data to reduce API calls.
    Supports:
    - cached_get_stock_data(ticker) -> default max period
    - cached_get_stock_data(ticker, period) -> explicit period string
    - cached_get_stock_data(ticker, start, end) -> explicit date range (YYYY-MM-DD)
    """
    try:
        if len(args) == 2:
            start, end = args
            # Detect YYYY-MM-DD date strings
            def _is_date(s):
                return isinstance(s, str) and len(s) == 10 and s[4] == '-' and s[7] == '-'
            if _is_date(start) and _is_date(end):
                return get_stock_data(ticker, start=start, end=end)
            # Fallback: treat as (period, start)
            return get_stock_data(ticker, period=start, start=end)
        elif len(args) == 1:
            period = args[0]
            return get_stock_data(ticker, period=period)
        else:
            return get_stock_data(ticker)
    except Exception:
        # On any error in wrapper, call with defaults to avoid breaking callers
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
    __table_args__ = {'extend_existing': True}  # Prevent duplicate table errors
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), nullable=False, unique=True)
    password = db.Column(db.String(255), nullable=False)  # allow hash length
    email = db.Column(db.String(50), nullable=True)  # Increased length for emails
    
    # Relationship with proper back_populates
    transactions = db.relationship('Dashinfo', back_populates='user_ref', cascade='all, delete-orphan')

class Dashinfo(db.Model):
    __tablename__ = 'dashinfo'
    __table_args__ = {'extend_existing': True}  # Prevent duplicate table errors
    
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

@app.route("/alamo/")
@app.route("/alamo")
def alamo():
    return redirect("https://github.com/solidsgroup/alamo/tree/flame")

@app.route("/classification")
@app.route("/classification/")
def classification():
    return redirect("https://github.com/meierms1/Supervised-Dimension-Reduction-For-Optical-Vapor-Sensing.git")

@app.route('/health')
def health():
    """Health check endpoint for deployment verification"""
    try:
        # Test database connection
        with db.engine.connect() as conn:
            conn.execute(text('SELECT 1'))
        
        # Test React build availability
        index_path = os.path.join(FRONTEND_BUILD_DIR, 'index.html')
        frontend_ok = os.path.isfile(index_path)
        
        return jsonify({
            'status': 'ok',
            'timestamp': datetime.datetime.utcnow().isoformat(),
            'database': 'connected',
            'frontend_build': 'available' if frontend_ok else 'missing',
            'questions_loaded': len(QUESTIONS),
            'python_version': sys.version,
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.datetime.utcnow().isoformat(),
        }), 500

@app.route('/sitemap.xml')
def sitemap():
    """Generate dynamic sitemap for SEO"""
    pages = [
        {'url': '/', 'priority': '1.0', 'changefreq': 'weekly'},
        {'url': '/about', 'priority': '0.9', 'changefreq': 'monthly'},
        {'url': '/resume', 'priority': '0.9', 'changefreq': 'monthly'},
        {'url': '/projects', 'priority': '0.8', 'changefreq': 'monthly'},
        {'url': '/finance', 'priority': '0.8', 'changefreq': 'weekly'},
        {'url': '/tools', 'priority': '0.7', 'changefreq': 'monthly'},
        {'url': '/quiz', 'priority': '0.6', 'changefreq': 'monthly'},
    ]
    
    sitemap_xml = ['<?xml version="1.0" encoding="UTF-8"?>']
    sitemap_xml.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    
    base_url = os.getenv('BASE_URL', 'https://meierms.com')
    last_modified = datetime.datetime.utcnow().strftime('%Y-%m-%d')
    
    for page in pages:
        sitemap_xml.append('  <url>')
        sitemap_xml.append(f'    <loc>{base_url}{page["url"]}</loc>')
        sitemap_xml.append(f'    <lastmod>{last_modified}</lastmod>')
        sitemap_xml.append(f'    <changefreq>{page["changefreq"]}</changefreq>')
        sitemap_xml.append(f'    <priority>{page["priority"]}</priority>')
        sitemap_xml.append('  </url>')
    
    sitemap_xml.append('</urlset>')
    
    response = app.response_class('\n'.join(sitemap_xml), mimetype='application/xml')
    return response

# Legacy Flask routes removed - now fully using React SPA routing
# All frontend routes are handled by the SPA catch-all route below

# SPA Route - Serve React Frontend
FRONTEND_BUILD_DIR = os.path.join(STATIC_DIR, 'frontend')

# Handle React build static assets (CSS, JS, etc.)
@app.route('/static/css/<path:filename>')
def serve_react_css(filename):
    """Serve CSS files from React build"""
    return send_from_directory(os.path.join(FRONTEND_BUILD_DIR, 'static', 'css'), filename)

@app.route('/static/js/<path:filename>')
def serve_react_js(filename):
    """Serve JS files from React build"""
    return send_from_directory(os.path.join(FRONTEND_BUILD_DIR, 'static', 'js'), filename)

@app.route('/static/media/<path:filename>')
def serve_react_media(filename):
    """Serve media files from React build"""
    # Media files are directly in static/frontend/static/ (no media subdirectory)
    return send_from_directory(os.path.join(FRONTEND_BUILD_DIR, 'static'), filename)

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def spa(path):
    """Serve React SPA with optimized routing"""
    # Allow API routes to pass through
    if path.startswith('api/'):
        abort(404)
    
    # Allow static routes to pass through to Flask's built-in static handler
    if path.startswith('static/'):
        abort(404)
    
    # Serve static files from React build if they exist (non-static paths)
    if path and '.' in path:
        candidate = os.path.join(FRONTEND_BUILD_DIR, path)
        if os.path.isfile(candidate):
            return send_from_directory(FRONTEND_BUILD_DIR, path)
    
    # For all other routes, serve the React SPA
    index_path = os.path.join(FRONTEND_BUILD_DIR, 'index.html')
    if os.path.isfile(index_path):
        return send_from_directory(FRONTEND_BUILD_DIR, 'index.html')
    
    # If build is missing, show error
    return jsonify({
        'error': 'React build not found',
        'help': 'Frontend build is missing. Please contact administrator.'
    }), 500

# Legacy Flask template routes removed - using React SPA for all frontend

# Legacy Flask template routes removed - using React SPA for all frontend



# Legacy Flask template routes removed - using React SPA for all frontend

# Health check and monitoring endpoints
@app.route('/health')
def health_check():
    """Health check endpoint for monitoring and deployment verification."""
    try:
        print("DEBUG: Health check starting...")
        
        # Test database connection
        with db.engine.connect() as conn:
            result = conn.execute(text('SELECT 1'))
            print("DEBUG: Basic database connection successful")
        
        # Test user table
        user_count = User.query.count()
        print(f"DEBUG: User count query successful: {user_count}")
        
        # Test a sample user query if users exist
        sample_user = None
        if user_count > 0:
            sample_user = User.query.first()
            print(f"DEBUG: Sample user: {sample_user.username if sample_user else 'None'}")
        
        return jsonify({
            'status': 'healthy',
            'database': 'connected',
            'users': user_count,
            'sample_user': sample_user.username if sample_user else None,
            'quiz_questions': len(QUESTIONS),
            'database_url_safe': DATABASE_URL[:50] + '...' if len(DATABASE_URL) > 50 else DATABASE_URL,
            'timestamp': datetime.datetime.now().isoformat()
        }), 200
    except Exception as e:
        print(f"DEBUG: Health check error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'error_type': type(e).__name__,
            'timestamp': datetime.datetime.now().isoformat()
        }), 503

@app.route('/api/debug/db-info')
def api_debug_db_info():
    """Debug endpoint to check database configuration."""
    try:
        database_url = app.config.get('SQLALCHEMY_DATABASE_URI', 'Not set')
        # Hide password for security
        safe_url = database_url
        if '@' in database_url:
            parts = database_url.split('@')
            if '://' in parts[0]:
                scheme_user = parts[0].split('://')
                if ':' in scheme_user[1]:
                    user_pass = scheme_user[1].split(':')
                    safe_url = f"{scheme_user[0]}://{user_pass[0]}:***@{parts[1]}"
        
        # Test database connection
        try:
            with db.engine.connect() as conn:
                conn.execute(text('SELECT 1'))
            db_status = "Connected"
        except Exception as e:
            db_status = f"Connection failed: {e}"
        
        # Get user info
        try:
            user_count = User.query.count()
            users = User.query.limit(3).all()
            user_info = [{'username': u.username, 'email': u.email, 'has_password': bool(u.password)} for u in users]
        except Exception as e:
            user_count = f"Query failed: {e}"
            user_info = []
        
        return jsonify({
            'database_url': safe_url,
            'database_status': db_status,
            'users_count': user_count,
            'sample_users': user_info,
            'questions_loaded': len(QUESTIONS)
        })
    except Exception as e:
        return jsonify({'error': str(e), 'error_type': type(e).__name__}), 500

@app.route('/api/debug/create-test-user', methods=['POST'])
def api_debug_create_test_user():
    """Debug endpoint to create a test user."""
    try:
        test_username = f"test_{int(time.time())}"  # Unique username
        test_password = "test123"
        
        user = User(username=test_username, password=test_password, email="test@example.com")
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Test user created: {test_username} / {test_password}',
            'user': {'username': test_username, 'password': test_password}
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

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

# New: Unit converter API endpoint
@app.route('/api/calculator/convert', methods=['POST'])
def api_calculator_convert():
    try:
        data = request.get_json() or {}
        input_value = data.get('input_value')
        input_unit = (data.get('input_unit') or '').strip()
        output_unit = (data.get('output_unit') or '').strip()

        if input_value is None or not input_unit or not output_unit:
            return jsonify({'success': False, 'message': 'input_value, input_unit and output_unit are required'}), 400
        try:
            value = float(input_value)
        except (TypeError, ValueError):
            return jsonify({'success': False, 'message': 'input_value must be a number'}), 400

        # Basic safety limits
        if len(input_unit) > 64 or len(output_unit) > 64:
            return jsonify({'success': False, 'message': 'Unit strings are too long'}), 400

        converter = GeneralConverter(value, input_unit, output_unit)
        result = converter.converted_value
        return jsonify({'success': True, 'result': result})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400

# New: Finance stock data API endpoint for React frontend
@app.route('/api/finance/stock-data', methods=['POST'])
def api_finance_stock_data():
    try:
        data = request.get_json(silent=True) or {}
        ticker = (data.get('ticker_name') or data.get('ticker') or '').strip().upper()
        if not ticker:
            return jsonify({'success': False, 'message': 'ticker_name is required'}), 400

        # period can be a string or list (frontend currently sends ['1y'])
        period = data.get('period')
        if isinstance(period, list) and period:
            period = period[0]
        elif not isinstance(period, str):
            period = None

        start = data.get('start_date') or data.get('start')
        end = data.get('end_date') or data.get('end')

        # Fetch time series data
        if start and end:
            labels, prices = cached_get_stock_data(ticker, start, end)
        elif period:
            labels, prices = cached_get_stock_data(ticker, period)
        else:
            labels, prices = cached_get_stock_data(ticker)

        if not labels or not prices:
            return jsonify({'success': False, 'message': f'No stock data found for {ticker}'}), 404

        # Fetch company info and map to an object
        info = cached_get_stock_info(ticker)
        info_obj = {}
        if isinstance(info, dict):
            # Normalize keys we care about
            info_obj = {
                'longName': info.get('longName') or info.get('shortName') or ticker,
                'industry': info.get('industry', 'N/A'),
                'sector': info.get('sector', 'N/A'),
                'fiftyTwoWeekLow': info.get('fiftyTwoWeekLow', 0.0) or 0.0,
                'fiftyTwoWeekHigh': info.get('fiftyTwoWeekHigh', 0.0) or 0.0,
                'dividendYield': info.get('dividendYield') or info.get('trailingAnnualDividendYield') or 0.0,
                'longBusinessSummary': info.get('longBusinessSummary', '')
            }
        elif isinstance(info, (list, tuple)) and len(info) >= 7:
            # Map from our backend.finance get_stock_info list format
            info_obj = {
                'longName': info[0] or ticker,
                'industry': info[1],
                'sector': info[2],
                'fiftyTwoWeekLow': info[3],
                'fiftyTwoWeekHigh': info[4],
                'dividendYield': info[5],
                'longBusinessSummary': info[6],
            }
        else:
            info_obj = {
                'longName': ticker,
                'industry': 'N/A',
                'sector': 'N/A',
                'fiftyTwoWeekLow': 0.0,
                'fiftyTwoWeekHigh': 0.0,
                'dividendYield': 0.0,
                'longBusinessSummary': ''
            }

        return jsonify({
            'success': True,
            'data': {
                'ticker': ticker,
                'labels': labels,
                'values': prices,
                'stock_info': info_obj,
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# New: Material properties API endpoint
@app.route('/api/calculator/material-properties', methods=['POST'])
def api_material_properties():
    try:
        data = request.get_json(silent=True) or {}
        # Expect names: young|shear|bulk|lame|poisson
        name_map = {
            'young': 'E',
            'shear': 'G',
            'bulk': 'K',
            'lame': 'lame',
            'poisson': 'Poisson',
        }
        first_name = (data.get('first_property_name') or '').strip().lower()
        second_name = (data.get('second_property_name') or '').strip().lower()
        try:
            first_value = float(data.get('first_property_value'))
            second_value = float(data.get('second_property_value'))
        except (TypeError, ValueError):
            return jsonify({'success': False, 'message': 'Property values must be numbers'}), 400

        if first_name not in name_map or second_name not in name_map:
            return jsonify({'success': False, 'message': 'Invalid property name'}), 400
        if first_name == second_name:
            return jsonify({'success': False, 'message': 'Please select two different properties'}), 400

        # Initialize all properties with -1
        kwargs = { 'K': -1, 'E': -1, 'lame': -1, 'G': -1, 'Poisson': -1 }
        kwargs[name_map[first_name]] = first_value
        kwargs[name_map[second_name]] = second_value

        # Compute using backend.calculator.material
        mat = material(**kwargs)
        result = {
            'E': float(mat.E),
            'G': float(mat.G),
            'K': float(mat.K),
            'lame': float(mat.lame),
            'Poisson': float(mat.Poisson),
        }
        return jsonify({'success': True, 'properties': result})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400

# ==================== Auth JSON API Endpoints ====================
@app.route('/api/auth/register', methods=['POST'])
def api_auth_register():
    data = request.get_json(silent=True) or {}
    username = (data.get('username') or '').strip()
    password = data.get('password') or ''
    email = (data.get('email') or '').strip() or None
    
    print(f"DEBUG: Register attempt - username: {username}, password_len: {len(password)}, email: {email}")
    
    if not username or not password:
        return jsonify({'success': False, 'message': 'username and password required'}), 400
    
    # Check if user exists
    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        print(f"DEBUG: User {username} already exists")
        return jsonify({'success': False, 'message': 'username already exists'}), 400
    
    try:
        # Store password as plaintext for debugging
        user = User(username=username, password=password, email=email)
        db.session.add(user)
        db.session.commit()
        print(f"DEBUG: User {username} created successfully")
        
        login_user(user)
        print(f"DEBUG: User {username} logged in successfully")
        return jsonify({'success': True, 'user': {'id': user.id, 'username': user.username}})
    except Exception as e:
        print(f"DEBUG: Register error: {e}")
        db.session.rollback()
        return jsonify({'success': False, 'message': f'registration error: {str(e)}'}), 500

@app.route('/api/auth/login', methods=['POST'])
def api_auth_login():
    data = request.get_json(silent=True) or {}
    username = (data.get('username') or '').strip()
    password = data.get('password') or ''
    
    print(f"DEBUG: Login attempt - username: {username}, password_len: {len(password)}")
    
    if not username or not password:
        return jsonify({'success': False, 'message': 'username and password required'}), 400
    
    try:
        user = User.query.filter_by(username=username).first()
        print(f"DEBUG: User lookup result: {'Found' if user else 'Not found'}")
        
        if not user:
            return jsonify({'success': False, 'message': 'invalid credentials'}), 401

        stored = user.password or ''
        print(f"DEBUG: Stored password length: {len(stored)}")
        
        # Simple plaintext comparison for debugging
        if stored == password:
            print(f"DEBUG: Password match for {username}")
            login_user(user)
            return jsonify({'success': True, 'user': {'id': user.id, 'username': user.username}})
        else:
            print(f"DEBUG: Password mismatch for {username}")
            print(f"DEBUG: Expected: '{stored}', Got: '{password}'")
            return jsonify({'success': False, 'message': 'invalid credentials'}), 401
            
    except Exception as e:
        print(f"DEBUG: Login exception: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'message': f'authentication error: {str(e)}'}), 500

    login_user(user)
    return jsonify({'success': True, 'user': {'id': user.id, 'username': user.username}})

@app.route('/api/auth/logout', methods=['POST'])
@login_required
def api_auth_logout():
    logout_user()
    return jsonify({'success': True})

@app.route('/api/auth/me', methods=['GET'])
def api_auth_me():
    if not current_user.is_authenticated:
        return jsonify({'authenticated': False})
    return jsonify({'authenticated': True, 'user': {'id': current_user.id, 'username': current_user.username}})

# ==================== Transactions API (for React Dashboard) ====================
@app.route('/api/transactions', methods=['GET'])
@login_required
def api_transactions():
    try:
        txs = Dashinfo.query.filter_by(user=current_user.id).order_by(Dashinfo.date.desc()).all()
        serialized = [
            {
                'id': t.id,
                'ticker': t.ticker,
                'price': t.price,
                'amount': t.amount,
                'type': t.type,
                'date': t.date.isoformat(),
                'total': t.total
            } for t in txs
        ]
        return jsonify({'success': True, 'transactions': serialized})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# ==================== Portfolio API (React) ====================
@app.route('/api/portfolio/stocks', methods=['GET'])
@login_required
def api_get_portfolio():
    try:
        transactions = Dashinfo.query.filter_by(user=current_user.id).all()
        portfolio = {}
        for tx in transactions:
            t = tx.ticker
            if t not in portfolio:
                portfolio[t] = {
                    'ticker': t,
                    'average_buy_price': 0.0,
                    'current_price': 0.0,
                    'shares_held': 0,
                    'total_cost_basis': 0.0,   # renamed internal meaning (buys only)
                    'total_current_value': 0.0,
                    'price_change': 0.0,
                    'percent_change': 0.0,
                }
            # Treat positive amount as BUY, negative as SELL (simpler, price sign ignored)
            if tx.amount > 0:  # BUY
                portfolio[t]['shares_held'] += tx.amount
                portfolio[t]['total_cost_basis'] += (abs(tx.price) * tx.amount)
            elif tx.amount < 0:  # SELL
                portfolio[t]['shares_held'] += tx.amount  # tx.amount negative reduces holdings
                # Simplified: do not adjust historical cost basis (no FIFO/LIFO) – unrealized P&L based on remaining shares

        # Post processing calculations
        result = []
        for t, data in portfolio.items():
            shares = data['shares_held']
            if shares <= 0:
                # Skip positions fully exited (could return zeroed entry if desired)
                continue
            cost_basis = data['total_cost_basis']
            avg_buy = cost_basis / shares if shares > 0 else 0.0
            current_price = cached_get_current_price(t)
            current_value = current_price * shares
            unrealized_gain = current_value - (avg_buy * shares)
            price_change = current_price - avg_buy
            percent_change = (price_change / avg_buy * 100) if avg_buy > 0 else 0.0

            enriched = {
                'ticker': t,
                'average_buy_price': round(avg_buy, 6),
                'current_price': round(current_price, 6),
                'shares_held': shares,
                'total_cost_basis': round(cost_basis, 2),
                'total_current_value': round(current_value, 2),
                'price_change': round(price_change, 6),
                'percent_change': round(percent_change, 4),
                # Compatibility fields for existing React Dashboard component
                'current_value': round(current_value, 2),
                'shares': shares,
                'purchase_price': round(avg_buy, 6),
                'gain_loss': round(unrealized_gain, 2),
            }
            result.append(enriched)

        return jsonify({'success': True, 'portfolio': result})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/portfolio/stocks', methods=['POST'])
@login_required
def api_add_portfolio_stock():
    try:
        data = request.get_json(silent=True) or {}
        ticker = (data.get('ticker') or '').strip().upper()
        shares = data.get('shares')
        buy_price = data.get('buy_price') or data.get('price')
        if not ticker or shares is None or buy_price is None:
            return jsonify({'success': False, 'message': 'ticker, shares and buy_price required'}), 400
        try:
            shares = float(shares)
            buy_price = float(buy_price)
        except ValueError:
            return jsonify({'success': False, 'message': 'shares and buy_price must be numbers'}), 400
        if shares <= 0 or buy_price <= 0:
            return jsonify({'success': False, 'message': 'shares and buy_price must be positive'}), 400
        now = datetime.datetime.utcnow()
        tx = Dashinfo(
            ticker=ticker,
            price=buy_price,
            date=now,
            type='BUY',
            amount=int(shares),
            user=current_user.id,
            total=buy_price * shares
        )
        db.session.add(tx)
        db.session.commit()
        cache.delete_memoized(cached_get_current_price, ticker)
        return api_get_portfolio()
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

# New: Sell shares endpoint
@app.route('/api/portfolio/stocks/sell', methods=['POST'])
@login_required
def api_sell_portfolio_stock():
    try:
        data = request.get_json(silent=True) or {}
        ticker = (data.get('ticker') or '').strip().upper()
        shares = data.get('shares')
        sell_price = data.get('sell_price') or data.get('price')
        if not ticker or shares is None or sell_price is None:
            return jsonify({'success': False, 'message': 'ticker, shares and sell_price required'}), 400
        try:
            shares = float(shares)
            sell_price = float(sell_price)
        except ValueError:
            return jsonify({'success': False, 'message': 'shares and sell_price must be numbers'}), 400
        if shares <= 0 or sell_price <= 0:
            return jsonify({'success': False, 'message': 'shares and sell_price must be positive'}), 400
        # Compute current held shares
        buy_sum = db.session.query(func.sum(Dashinfo.amount)).filter_by(user=current_user.id, ticker=ticker, type='BUY').scalar() or 0
        sell_sum = db.session.query(func.sum(Dashinfo.amount)).filter_by(user=current_user.id, ticker=ticker, type='SELL').scalar() or 0
        held = buy_sum + sell_sum  # sells are negative
        if held < shares:
            return jsonify({'success': False, 'message': 'Not enough shares to sell'}), 400
        now = datetime.datetime.utcnow()
        tx = Dashinfo(
            ticker=ticker,
            price= -sell_price,  # maintain legacy convention
            date=now,
            type='SELL',
            amount= -int(shares),
            user=current_user.id,
            total= sell_price * shares
        )
        db.session.add(tx)
        db.session.commit()
        cache.delete_memoized(cached_get_current_price, ticker)
        return api_get_portfolio()
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

# New: Delete all transactions for a ticker (dangerous – removes history)
@app.route('/api/portfolio/stocks/<ticker>', methods=['DELETE'])
@login_required
def api_delete_ticker(ticker):
    try:
        ticker = (ticker or '').strip().upper()
        if not ticker:
            return jsonify({'success': False, 'message': 'ticker required'}), 400
        Dashinfo.query.filter_by(user=current_user.id, ticker=ticker).delete()
        db.session.commit()
        cache.delete_memoized(cached_get_current_price, ticker)
        return api_get_portfolio()
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

# Initialize database tables
_db_initialized = False

def init_db():
    """Initialize database tables (idempotent)."""
    global _db_initialized
    if _db_initialized:
        return
    try:
        with app.app_context():
            # Test database connection with more detailed error handling
            print(f"🔗 Connecting to database...")
            print(f"📊 Environment variables check:")
            print(f"   DATABASE_URL: {'✅ Set' if os.getenv('DATABASE_URL') else '❌ Not set'}")
            print(f"   SECRET_KEY: {'✅ Set' if os.getenv('SECRET_KEY') else '❌ Not set'}")
            print(f"   DEFAULT_USERNAME: {os.getenv('DEFAULT_USERNAME', '❌ Not set')}")
            print(f"   DEFAULT_PASSWORD: {'✅ Set' if os.getenv('DEFAULT_PASSWORD') else '❌ Not set'}")
            print(f"   DEFAULT_EMAIL: {os.getenv('DEFAULT_EMAIL', '❌ Not set')}")
            print(f"   FLASK_ENV: {os.getenv('FLASK_ENV', '❌ Not set')}")
            
            # Show actual DATABASE_URL (masked)
            db_url = DATABASE_URL
            if '@' in db_url:
                parts = db_url.split('@')
                if '://' in parts[0]:
                    scheme_user = parts[0].split('://')
                    if ':' in scheme_user[1]:
                        user_pass = scheme_user[1].split(':')
                        db_url = f"{scheme_user[0]}://{user_pass[0]}:***@{parts[1]}"
            print(f"   Processed DATABASE_URL: {db_url[:100]}...")
            
            with db.engine.connect() as conn:
                # Test basic connectivity
                result = conn.execute(text('SELECT 1'))
                print("✅ Database connection successful")
                
                # For PostgreSQL, also test that we can create schemas if needed
                if DATABASE_URL.startswith('postgresql://'):
                    try:
                        conn.execute(text("SELECT current_database(), current_user"))
                        print("✅ PostgreSQL connection verified")
                    except Exception as e:
                        print(f"⚠️ PostgreSQL verification warning: {e}")
            
            # Create tables if they don't exist (idempotent)
            db.create_all()
            print("✅ Database tables created successfully")
            print(f"📊 Database URL: {app.config['SQLALCHEMY_DATABASE_URI']}")
            
            # Verify tables were created by checking User table
            user_count = User.query.count()
            print(f"👥 User count in database: {user_count}")
            
            _db_initialized = True
    except Exception as e:
        print(f"❌ Database initialization error: {e}")
        print(f"   Error type: {type(e).__name__}")
        
        # More specific error handling for common PostgreSQL issues
        error_str = str(e).lower()
        if 'password authentication failed' in error_str:
            print("   🔑 Issue: Password authentication failed")
            print("   💡 Check: DATABASE_URL environment variable has correct credentials")
        elif 'could not connect to server' in error_str:
            print("   🌐 Issue: Could not connect to database server")
            print("   💡 Check: Database server is running and accessible")
        elif 'database' in error_str and 'does not exist' in error_str:
            print("   🗄️  Issue: Database does not exist")
            print("   💡 Check: Database was created on your PostgreSQL service")
        elif 'ssl' in error_str:
            print("   🔒 Issue: SSL connection problem")
            print("   💡 Check: DATABASE_URL includes proper SSL configuration")
        
        # Don't exit on table exists error - this is expected in some deployments
        if "already exists" not in error_str:
            print("   💡 Consider using a persistent database service like Neon, PlanetScale, or Railway.")
            print("   💡 Ensure DATABASE_URL environment variable is correctly set")
        _db_initialized = True  # Mark as initialized to prevent repeated attempts

# Call immediately so DB is ready under any server (flask run, gunicorn, etc.)
init_db()

if __name__ == "__main__":
    # Initialize database (idempotent)
    init_db()
    # Use environment variables for production configuration
    debug_mode = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    port = int(os.getenv('PORT', 5000))
    host = os.getenv('HOST', '0.0.0.0')
    app.run(debug=debug_mode, port=port, host=host)
