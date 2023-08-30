import numpy as np
import pandas as pd
import requests as r
import xlsxwriter as x
import math 

from apitk import IEX_CLOUD_API_TOKEN

from flask import Flask, render_template, request, redirect
from flask_login import LoginManager, login_required, UserMixin, login_user, logout_user, current_user
from flask_sqlalchemy import SQLAlchemy
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import InputRequired, Length, ValidationError 

app=Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database2.db'
app.config['SECRET_KEY'] = "secret"
db = SQLAlchemy(app)
app.app_context().push()

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), nullable=False, unique = True)
    password = db.Column(db.String(20), nullable = False)
    email = db.Column(db.String(20), nullable = True)

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

@app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        login_user(user)

        flask.flash('Logged in successfully.')

        next = flask.request.args.get('next')
        if not url_has_allowed_host_and_scheme(next, request.host):
            return flask.abort(400)

        return flask.redirect(next or flask.url_for('index'))
    return render_template('/sign-in.html', form=form)

def user_on_mobile() -> bool:
    user_agent = request.headers.get("User-Agent")
    user_agent = user_agent.lower()
    mobile = ["android", "iphone"]
    if any(x in user_agent for x in mobile):
        return True
    return False

@app.route("/")
def home():
    return render_template("about.html")

@app.route("/about/")
def about():
    return render_template("about.html")

@app.route("/resume/")
def resume():
    if (user_on_mobile()): return render_template("resume-mobile.html")
    return render_template("resume.html")

@app.route("/finance/")
@login_required
def finance():
    return render_template("finance.html")

@app.route("/projects/")
def projects():
    if (user_on_mobile()): return render_template("projects-mobile.html")
    return render_template("projects.html")

@app.route("/unittool/")
@login_required
def unittool():
    return render_template("tools.html")

@app.route("/index")
def index():
    return render_template("index.html")

@app.route("/sign-in/", methods=["GET", "POST"])
def signin():
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user:
            if user.password == form.password.data:
                login_user(user)
                return redirect("/about/")
            else:
                return "Bad Password"
    return render_template("/sign-in.html", form=form)

@app.route("/dashboard")
@login_required
def dashboard():
    return "Dashboard"


@app.route("/register/", methods=["GET", "POST"])
def signup():
    form = RegisterForm()
    if form.validate_on_submit():
        new_user = User(username=form.username.data, password=form.password.data, email=form.email.data)
        db.session.add(new_user)
        db.session.commit()

        return redirect("/sign-in/")
    return render_template('/register.html', form=form)

@app.route("/logout/")
@login_required
def logout():
    logout_user()
    return redirect("/about/")
#saving
if __name__ == "__main__":
    app.run(debug=False, port=5000, host="0.0.0.0")