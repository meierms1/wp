import numpy as np
import pandas as pd
import requests as r
import json
import random
import xlsxwriter as x
import math, datetime, json
from calculator import material,  BaseConverter, GeneralConverter
from finance import get_stock_data, get_stock_info, get_current_price
from apitk import IEX_CLOUD_API_TOKEN

from flask import Flask, render_template, request, redirect, flash, url_for, abort, session
from flask_login import LoginManager, login_required, UserMixin, login_user, logout_user, current_user
from flask_sqlalchemy import SQLAlchemy
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField, IntegerField
from wtforms.validators import InputRequired, Length, ValidationError 
from flask_mail import Mail, Message
from sqlalchemy.sql import func
app=Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database2.db'
app.config['SECRET_KEY'] = "secret"
db = SQLAlchemy(app)
app.app_context().push()
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USE_TLS'] = False
app.config['MAIL_USE_SSL'] = True
app.config['MAIL_USERNAME'] = 'm85830874@gmail.com'
app.config['MAIL_PASSWORD'] = 'wplpnspxnnnlgvwh'
mail = Mail(app)


login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"

# Load quiz questions from JSON file
try:
    with open('FIRE2.json', 'r') as f:
        questions = json.load(f)
except FileNotFoundError:
    questions = []
    print("Error: questions.json not found")

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), nullable=False, unique = True)
    password = db.Column(db.String(20), nullable = False)
    email = db.Column(db.String(20), nullable = True)
    transactions=db.relationship('Dashinfo', backref="user_id", uselist=True,lazy="select")

class Dashinfo(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    ticker = db.Column(db.String(10), nullable=False, unique=False)
    price = db.Column(db.Float, nullable=False, unique=False)
    date = db.Column(db.DateTime, nullable=False, unique=False)
    type = db.Column(db.String(10), nullable=False)
    user = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    amount = db.Column(db.Integer)
    total = db.Column(db.Float)




class RegisterForm(FlaskForm):
    username = StringField(validators=[InputRequired(), Length(min=4, max=40)], render_kw={"placeholder":"Username"})
    password = StringField(validators=[InputRequired(), Length(min=4, max=40)], render_kw={"placeholder":"Password"})
    email = StringField(validators=[InputRequired(), Length(min=4, max=40)], render_kw={"placeholder":"email"})
    submit = SubmitField("Register")

    def validade_username(self, username):
        existing_user_name = User.query.filter_by(username=username.data).first()

        if existing_user_name:
            raise ValidationError("User name is taken")

class LoginForm(FlaskForm):
    username = StringField(validators=[InputRequired(), Length(min=4, max=40)], render_kw={"placeholder":"Username"})
    password = StringField(validators=[InputRequired(), Length(min=4, max=40)], render_kw={"placeholder":"Password"})
    email = StringField( render_kw={"placeholder":"email"})
    submit = SubmitField("Register")

class QuizForm(FlaskForm):
    num_questions = IntegerField('Number of Questions', validators=[InputRequired()], render_kw={'placeholder': 'Enter number (1-100)'})
    submit = SubmitField('Start Quiz')

@app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user:
            if user.password == form.password.data:
                login_user(user)
                flash('Logged in successfully.')
        next = request.args.get('next')
        return redirect(next or url_for('/about/'))
    
    return render_template('/sign-in.html', form=form)

@app.route("/sign-in/", methods=["GET", "POST"])
def signin():
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user:
            if user.password == form.password.data:
                login_user(user)
                return redirect("/dashboard/")
            else:
                return "Bad Password"
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

@app.route("/finance/", methods=["GET", "POST"])
def finance():
    if request.method == "POST":
        ticker = request.form.get("ticker_name")
        period = request.form.get("period")
        start = request.form.get("start_date")
        end = request.form.get("end_date")
        print(period)
        print(request.form)
        if period != "":
            period = request.form.get("period")
            label, price = get_stock_data(ticker, period)

        elif start != "":
            start = request.form.get("start_date")
            end = request.form.get("end_date")
            label, price = get_stock_data(ticker, start, end)
        else:
            print("HERE")
            label, price = get_stock_data(ticker)       

        info_data=get_stock_info(ticker)

        if (user_on_mobile()): return render_template("finance-mobile.html",  labels=label, values=price, stock_info = info_data, hide_block=False)
        return render_template("finance.html", labels=label, values=price, stock_info = info_data, hide_block=False)
    label = ["1", "2"]
    price = [1,1]
    info_data=["-","-","-","-","-","-","-"]
    if (user_on_mobile()): return render_template("finance-mobile.html", labels=label, values=price, stock_info = info_data, hide_block=True)
    return render_template("finance.html", labels=label, values=price, stock_info = info_data, hide_block=True)

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
                print(output_value)
                return render_template("tools.html", success_convert=True, value=str(output_value))
            except:
                return render_template("tools.html", success_convert=True, value="Incompatible units")
    return render_template("tools.html", value= "Value")



@app.route("/dashboard/", methods=["GET", "POST"])
@login_required
def dashboard():
    c_user = current_user.id
    if request.method == "POST":        
        if "add_buy" in request.form:
            ticker = request.form.get("ticker_name")
            price = float(request.form.get("ticker_price"))
            date = request.form.get("action_date")
            date = datetime.datetime.strptime(date, '%Y-%m-%d')
            amount = int(request.form.get("ticker_amount"))
            total = amount * price
            user = c_user
            new_transaction = Dashinfo(ticker = ticker, price = price,date = date,type = "BUY", amount = amount,user = user, total=total)
            db.session.add(new_transaction)
            db.session.commit()           
        elif "add_sell" in request.form:
            ticker = request.form.get("ticker_name")
            price = float(request.form.get("ticker_price"))
            date = request.form.get("action_date")
            date = datetime.datetime.strptime(date, '%Y-%m-%d')
            amount = int(request.form.get("ticker_amount"))
            user = c_user

            current_stock_amount_buy = db.session.query(func.sum(Dashinfo.amount)).filter(Dashinfo.user==c_user, Dashinfo.ticker==ticker, Dashinfo.type=="BUY").scalar()
            current_stock_amount_sell = db.session.query(func.sum(Dashinfo.amount)).filter(Dashinfo.user==c_user, Dashinfo.ticker==ticker, Dashinfo.type=="SELL").scalar()
            if current_stock_amount_buy is None: current_stock_amount_buy = 0
            if current_stock_amount_sell is None: current_stock_amount_sell = 0
            current_ballance = current_stock_amount_buy - current_stock_amount_sell

            if current_ballance < int(amount):
                flash("You can not sell more than you have")
            else:
                new_transaction = Dashinfo(ticker = ticker, price = price*(-1),date = date,type = "SELL", amount = amount*(-1), user = user)
                db.session.add(new_transaction)
                db.session.commit()

        elif "remove_transaction" in request.form:
            _id = request.form.get("remove_from_db")
            user = c_user
            transaction_id = Dashinfo.query.filter(Dashinfo.id==_id).first()

            if transaction_id.user == user:
                db.session.delete(transaction_id)
                db.session.commit()
            else:
                flash("Declined: This transaction doesn't belong to you.")

    data = Dashinfo.query.filter(Dashinfo.user==c_user).all()
    data_config=[]
    names = [] 
    for i in data:
        if (user_on_mobile()):
            data_config.append([i.id,i.ticker, np.abs(i.price), np.abs(i.amount), i.type])
        else:
            data_config.append([i.id,i.ticker, np.abs(i.price), i.date, np.abs(i.amount), i.type])
        if i.ticker not in names:
            names.append(i.ticker)

    sum_price = []
    local_changes = [] 
    for i in names:
        data = Dashinfo.query.filter(Dashinfo.user==c_user, Dashinfo.ticker==i).all()
        p_buy = db.session.query(func.sum(Dashinfo.price)).filter(Dashinfo.user==c_user, Dashinfo.ticker==i, Dashinfo.type=="BUY").scalar()
        p_sell = db.session.query(func.sum(Dashinfo.price)).filter(Dashinfo.user==c_user, Dashinfo.ticker==i, Dashinfo.type=="SELL").scalar()
        a_buy = db.session.query(func.sum(Dashinfo.amount)).filter(Dashinfo.user==c_user, Dashinfo.ticker==i, Dashinfo.type=="BUY").scalar()
        a_sell = db.session.query(func.sum(Dashinfo.amount)).filter(Dashinfo.user==c_user, Dashinfo.ticker==i, Dashinfo.type=="SELL").scalar()
        
        if p_buy is None: p_buy = 0; 
        if p_sell is None: p_sell = 0; 
        if a_buy is None: a_buy = 0; 
        if a_sell is None: a_sell = 0;       
        value = (p_buy*a_buy - p_sell*a_sell)
        print(f"{i} price {value}")

        avg_prepare = [j.price  for j in data if j.type == "BUY"]
        avg_prepare2 = [j.amount  for j in data if j.type == "BUY"]
        avg_prepare3 = []
        remeinder = np.abs(a_sell)
        print(remeinder)
        print(a_sell)

        total_buy = sum([i*j for i,j in zip(avg_prepare, avg_prepare2)])

        price_avg = total_buy / a_buy

        print(f"{i} avg price {price_avg}")  
 
        current_price = get_current_price(i)
        current_cap = (a_buy - a_sell) * price_avg  
        current_market = (a_buy - a_sell) * current_price
        print(current_price)      

        sum_price.append(value)
        local_changes.append(current_market - current_cap)

    total_capital = round(sum(sum_price), 2)
    total_change = round(sum(local_changes),2)
    
    if total_change is None: total_change=0
    if total_capital is None or total_capital==0: total_capital=1
    if (user_on_mobile()): return render_template('/dashboard-mobile.html', data_table=data_config, tickers_list=names, sum_price=sum_price, local_changes=local_changes, total_capital=total_capital, total_change=total_change)
    return render_template('/dashboard.html', data_table=data_config, tickers_list=names, sum_price=sum_price, local_changes=local_changes, total_capital=total_capital, total_change=total_change)

@app.route("/register/", methods=["GET", "POST"])
def signup():
    form = RegisterForm()
    if form.validate_on_submit():
        new_user = User(username=form.username.data, password=form.password.data, email=form.email.data)
        db.session.add(new_user)
        db.session.commit()
        return redirect("/sign-in/")
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
        if n < 1 or n > len(questions):
            flash(f'Please select between 1 and 100 questions.', 'error')
            return render_template('firequiz.html', form=form)
        session['quiz_questions'] = random.sample(range(len(questions)), n)
        session['quiz_current'] = 0
        session['quiz_score'] = 0
        return redirect(url_for('quiz_question'))
    return render_template('firequiz.html', form=form)

@app.route('/quiz_question')
def quiz_question():
    if 'quiz_questions' not in session or session['quiz_current'] >= len(session['quiz_questions']):
        return redirect(url_for('quiz_result'))
    q_index = session['quiz_questions'][session['quiz_current']]
    question = questions[q_index]
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
    question = questions[q_index]
    correct = answer == question['correct_answer']
    if correct:
        session['quiz_score'] += 1
    session['quiz_feedback'] = {
        'correct': correct,
        'explanation': question['explanation'] if not correct else '',
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

if __name__ == "__main__":
    app.run(debug=True) #False, port=5000, host="0.0.0.0")
