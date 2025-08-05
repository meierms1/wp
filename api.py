import json
import random
import datetime
import os
from calculator import material, BaseConverter, GeneralConverter

# Import finance functions with error handling
try:
    from finance import get_stock_data, get_stock_info, get_current_price
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

from flask import Flask, request, jsonify
from flask_login import LoginManager, login_required, UserMixin, login_user, logout_user, current_user
from flask_sqlalchemy import SQLAlchemy
from flask_caching import Cache
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField, IntegerField
from wtforms.validators import InputRequired, Length, ValidationError 
from flask_mail import Mail, Message
from flask_cors import CORS
from sqlalchemy.sql import func
import bcrypt

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for React frontend
CORS(app, origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"])

# Configuration
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///database2.db')
if DATABASE_URL.startswith('postgres://'):
    DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)

app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', "secret-change-this-in-production")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['CACHE_TYPE'] = 'simple'
app.config['CACHE_DEFAULT_TIMEOUT'] = 300

# Initialize extensions
db = SQLAlchemy(app)
cache = Cache(app)
login_manager = LoginManager()
login_manager.init_app(app)

# Email configuration
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 465))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'False').lower() == 'true'
app.config['MAIL_USE_SSL'] = os.getenv('MAIL_USE_SSL', 'True').lower() == 'true'
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME', 'm85830874@gmail.com')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD', 'wplpnspxnnnlgvwh')
mail = Mail(app)

# Database Models
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), nullable=False, unique=True)
    password = db.Column(db.String(80), nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username
        }

class Stock(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    ticker = db.Column(db.String(10), nullable=False)
    shares = db.Column(db.Float, nullable=False)
    purchase_price = db.Column(db.Float, nullable=False)
    purchase_date = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'ticker': self.ticker,
            'shares': self.shares,
            'purchase_price': self.purchase_price,
            'purchase_date': self.purchase_date.isoformat()
        }

class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    description = db.Column(db.String(200), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    category = db.Column(db.String(50), nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'description': self.description,
            'amount': self.amount,
            'date': self.date.isoformat(),
            'category': self.category
        }

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Load quiz questions
try:
    with open('FIRE2.json', 'r') as f:
        questions = json.load(f)
except FileNotFoundError:
    questions = []
    print("Warning: FIRE2.json not found, using empty questions list")

# Cached wrapper functions
@cache.memoize(timeout=300)
def cached_get_current_price(ticker):
    return get_current_price(ticker)

@cache.memoize(timeout=600)
def cached_get_stock_data(ticker, *args):
    if len(args) == 1:
        return get_stock_data(ticker, args[0])
    elif len(args) == 2:
        return get_stock_data(ticker, args[0], args[1])
    else:
        return get_stock_data(ticker)

@cache.memoize(timeout=3600)
def cached_get_stock_info(ticker):
    return get_stock_info(ticker)

# API Routes

# Authentication Routes
@app.route('/api/auth/register', methods=['POST'])
def api_register():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'success': False, 'message': 'Username and password are required'}), 400
        
        if len(username) < 4 or len(username) > 20:
            return jsonify({'success': False, 'message': 'Username must be 4-20 characters long'}), 400
        
        if len(password) < 4 or len(password) > 80:
            return jsonify({'success': False, 'message': 'Password must be 4-80 characters long'}), 400
        
        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            return jsonify({'success': False, 'message': 'Username already exists'}), 400
        
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        new_user = User(username=username, password=hashed_password)
        
        db.session.add(new_user)
        db.session.commit()
        
        login_user(new_user)
        
        return jsonify({
            'success': True, 
            'message': 'Account created successfully',
            'user': new_user.to_dict()
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def api_login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'success': False, 'message': 'Username and password are required'}), 400
        
        user = User.query.filter_by(username=username).first()
        
        if user and bcrypt.checkpw(password.encode('utf-8'), user.password):
            login_user(user)
            return jsonify({
                'success': True, 
                'message': 'Login successful',
                'user': user.to_dict()
            })
        else:
            return jsonify({'success': False, 'message': 'Invalid username or password'}), 401
            
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/auth/logout', methods=['POST'])
@login_required
def api_logout():
    logout_user()
    return jsonify({'success': True, 'message': 'Logged out successfully'})

@app.route('/api/auth/me', methods=['GET'])
@login_required
def api_get_current_user():
    return jsonify({'user': current_user.to_dict()})

# Finance Routes
@app.route('/api/finance/stock-data', methods=['POST'])
def api_get_stock_data():
    try:
        data = request.get_json()
        ticker = data.get('ticker_name', '').upper()
        periods = data.get('period', [])
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        if not ticker:
            return jsonify({'success': False, 'message': 'Ticker symbol is required'}), 400
        
        # Handle period or date range
        if start_date and end_date:
            labels, values = cached_get_stock_data(ticker, start_date, end_date)
        elif periods:
            period = periods[0] if isinstance(periods, list) else periods
            labels, values = cached_get_stock_data(ticker, period)
        else:
            labels, values = cached_get_stock_data(ticker, 'max')
        
        # Get stock info
        stock_info = cached_get_stock_info(ticker)
        
        return jsonify({
            'success': True,
            'data': {
                'labels': labels,
                'values': values,
                'stock_info': stock_info,
                'ticker': ticker
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/finance/current-price/<ticker>', methods=['GET'])
def api_get_current_price(ticker):
    try:
        price = cached_get_current_price(ticker.upper())
        return jsonify({'success': True, 'price': price, 'ticker': ticker.upper()})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# Portfolio Routes
@app.route('/api/portfolio/stocks', methods=['GET'])
@login_required
def api_get_portfolio():
    try:
        stocks = Stock.query.filter_by(user_id=current_user.id).all()
        portfolio_data = []
        
        for stock in stocks:
            current_price = cached_get_current_price(stock.ticker)
            portfolio_data.append({
                **stock.to_dict(),
                'current_price': current_price,
                'current_value': stock.shares * current_price,
                'gain_loss': (stock.shares * current_price) - (stock.shares * stock.purchase_price)
            })
        
        return jsonify({'success': True, 'portfolio': portfolio_data})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/portfolio/stocks', methods=['POST'])
@login_required
def api_add_stock():
    try:
        data = request.get_json()
        ticker = data.get('ticker', '').upper()
        shares = float(data.get('shares', 0))
        purchase_price = float(data.get('purchase_price', 0))
        
        if not ticker or shares <= 0 or purchase_price <= 0:
            return jsonify({'success': False, 'message': 'Invalid stock data'}), 400
        
        new_stock = Stock(
            user_id=current_user.id,
            ticker=ticker,
            shares=shares,
            purchase_price=purchase_price
        )
        
        db.session.add(new_stock)
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Stock added to portfolio', 'stock': new_stock.to_dict()})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# Transaction Routes
@app.route('/api/transactions', methods=['GET'])
@login_required
def api_get_transactions():
    try:
        transactions = Transaction.query.filter_by(user_id=current_user.id).order_by(Transaction.date.desc()).all()
        return jsonify({'success': True, 'transactions': [t.to_dict() for t in transactions]})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/transactions', methods=['POST'])
@login_required
def api_add_transaction():
    try:
        data = request.get_json()
        description = data.get('description')
        amount = float(data.get('amount', 0))
        category = data.get('category', 'Other')
        
        if not description or amount == 0:
            return jsonify({'success': False, 'message': 'Description and amount are required'}), 400
        
        new_transaction = Transaction(
            user_id=current_user.id,
            description=description,
            amount=amount,
            category=category
        )
        
        db.session.add(new_transaction)
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Transaction added', 'transaction': new_transaction.to_dict()})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# Calculator Routes
@app.route('/api/calculator/convert', methods=['POST'])
def api_unit_convert():
    try:
        data = request.get_json()
        input_value = float(data.get('input_value', 0))
        input_unit = data.get('input_unit', '')
        output_unit = data.get('output_unit', '')
        
        if not input_unit or not output_unit:
            return jsonify({'success': False, 'message': 'Input and output units are required'}), 400
        
        # Use the existing calculator
        converter = GeneralConverter()
        result = converter.convert(input_value, input_unit, output_unit)
        
        return jsonify({'success': True, 'result': result})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# Quiz Routes
@app.route('/api/quiz/questions', methods=['GET'])
def api_get_quiz_questions():
    try:
        # Get the number of questions requested (default to 10)
        num_questions = request.args.get('count', 10, type=int)
        
        # Ensure we don't exceed available questions
        available_questions = len(questions)
        if num_questions > available_questions:
            num_questions = available_questions
        
        # Randomly select questions if count is specified
        import random
        if num_questions < available_questions:
            selected_questions = random.sample(questions, num_questions)
        else:
            selected_questions = questions
        
        # Add sequential IDs for this quiz session
        for i, question in enumerate(selected_questions):
            question['id'] = i
        
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
        data = request.get_json()
        answers = data.get('answers', {})
        quiz_questions = data.get('questions', [])
        
        score = 0
        total_questions = len(quiz_questions)
        
        # Compare user answers with correct answers from the submitted questions
        for question in quiz_questions:
            question_id = str(question.get('id'))
            user_answer = answers.get(question_id)
            correct_answer = question.get('correct_answer')
            if user_answer == correct_answer:
                score += 1
        
        percentage = round((score / total_questions * 100), 1) if total_questions > 0 else 0
        
        return jsonify({
            'success': True,
            'score': score,
            'total': total_questions,
            'percentage': percentage
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# Initialize database
with app.app_context():
    try:
        db.create_all()
        print("Database tables created successfully")
    except Exception as e:
        print(f"Error creating database tables: {e}")

if __name__ == '__main__':
    print(f"Database URL: {app.config['SQLALCHEMY_DATABASE_URI']}")
    app.run(debug=True, host='0.0.0.0', port=5000)
