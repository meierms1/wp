import numpy as np
import pandas as pd
import requests as r
import xlsxwriter as x
import math 
from calculator import material,  BaseConverter

from apitk import IEX_CLOUD_API_TOKEN

from flask import Flask, render_template, request, redirect
from flask_login import LoginManager, login_required, UserMixin, login_user, logout_user, current_user
from flask_sqlalchemy import SQLAlchemy
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import InputRequired, Length, ValidationError 
from flask_mail import Mail, Message
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

@app.route("/finance/")
@login_required
def finance():
    return render_template("finance.html")

@app.route("/projects/")
def projects():
    if (user_on_mobile()): return render_template("projects-mobile.html")
    return render_template("projects.html")

@app.route("/calculator/", methods=["GET","POST"])
@login_required
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
            convert = BaseConverter(input_value, input_unit, output_unit)
            output_value = convert.converted_value
            print(output_value)
            return render_template("tools.html", success_convert=True, value=str(output_value))

    return render_template("tools.html", value= "Value")

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

@app.route("/dashboard/")
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