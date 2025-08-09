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

from flask import Flask, render_template, request, redirect, flash, url_for, abort, session, jsonify, send_from_directory
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

# Enable CORS for API routes (development)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"]}}, supports_credentials=True)

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
# Session / cookie settings for cross-origin React dev (adjust for production HTTPS)
app.config.setdefault('SESSION_COOKIE_SAMESITE', 'None')
app.config.setdefault('SESSION_COOKIE_SECURE', False)  # Set True when using HTTPS

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
login_manager.login_view = None  # Using custom unauthorized handler + JSON APIs

# Provide JSON instead of redirect for unauthorized access (API friendly)
@login_manager.unauthorized_handler
def unauthorized_handler():
    # Return JSON for API requests; otherwise send user to SPA root ("/") since legacy home route removed.
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
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), nullable=False, unique=True)
    password = db.Column(db.String(255), nullable=False)  # allow hash length
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

@app.route("/alamo/")
@app.route("/alamo")
def alamo():
    return redirect("https://github.com/solidsgroup/alamo/tree/flame")

@app.route("/classification")
@app.route("/classification/")
def classification():
    return redirect("https://github.com/meierms1/Supervised-Dimension-Reduction-For-Optical-Vapor-Sensing.git")

# @app.route("/", methods=["GET","POST"])
# def home():
#     return render_template('about.html')
# @app.route("/about/", methods=["GET","POST"])
# def about():
#     return render_template('about.html')

@app.route('/health')
def health():
    return jsonify({'status': 'ok'}), 200

FRONTEND_BUILD_DIR = os.path.join(STATIC_DIR, 'frontend')

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def spa(path):
    # Allow API and existing static/assets to pass through
    if path.startswith('api/'):
        abort(404)
    # Serve existing static files directly if they exist inside frontend build
    if path:
        candidate = os.path.join(FRONTEND_BUILD_DIR, path)
        if os.path.isfile(candidate):
            rel_path = os.path.relpath(candidate, FRONTEND_BUILD_DIR)
            return send_from_directory(FRONTEND_BUILD_DIR, rel_path)
    # Fallback to index.html (React SPA entry)
    index_path = os.path.join(FRONTEND_BUILD_DIR, 'index.html')
    if os.path.isfile(index_path):
        return send_from_directory(FRONTEND_BUILD_DIR, 'index.html')
    # If build missing, return simple message (avoids TemplateNotFound)
    return jsonify({'error': 'frontend build not found', 'expected_dir': FRONTEND_BUILD_DIR}), 500

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
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), nullable=False, unique=True)
    password = db.Column(db.String(255), nullable=False)  # allow hash length
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

@app.route("/alamo/")
@app.route("/alamo")
def alamo():
    return redirect("https://github.com/solidsgroup/alamo/tree/flame")

@app.route("/classification")
@app.route("/classification/")
def classification():
    return redirect("https://github.com/meierms1/Supervised-Dimension-Reduction-For-Optical-Vapor-Sensing.git")

# @app.route("/", methods=["GET","POST"])
# def home():
#     return render_template('about.html')
# @app.route("/about/", methods=["GET","POST"])
# def about():
#     return render_template('about.html')

@app.route('/health')
def health():
    return jsonify({'status': 'ok'}), 200

FRONTEND_BUILD_DIR = os.path.join(STATIC_DIR, 'frontend')

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def spa(path):
    # Allow API and existing static/assets to pass through
    if path.startswith('api/'):
        abort(404)
    # Serve existing static files directly if they exist inside frontend build
    if path:
        candidate = os.path.join(FRONTEND_BUILD_DIR, path)
        if os.path.isfile(candidate):
            rel_path = os.path.relpath(candidate, FRONTEND_BUILD_DIR)
            return send_from_directory(FRONTEND_BUILD_DIR, rel_path)
    # Fallback to index.html (React SPA entry)
    index_path = os.path.join(FRONTEND_BUILD_DIR, 'index.html')
    if os.path.isfile(index_path):
        return send_from_directory(FRONTEND_BUILD_DIR, 'index.html')
    # If build missing, return simple message (avoids TemplateNotFound)
    return jsonify({'error': 'frontend build not found', 'expected_dir': FRONTEND_BUILD_DIR}), 500
