import numpy as np
import pandas as pd
import requests as r
import xlsxwriter as x
import math 

from apitk import IEX_CLOUD_API_TOKEN

from flask import Flask, render_template

app=Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/about/")
def about():
    return render_template("about.html")

@app.route("/resume/")
def resume():
    return render_template("resume.html")

@app.route("/finance")
def finance():
    return render_template("finance.html")

@app.route("/projects/")
def projects():
    return render_template("projects.html")

@app.route("/unittool/")
def unittool():
    return render_template("unittool.html")

@app.route("/index")
def index():
    return render_template("index.html")

@app.route("/sign-in/")
def signin():
    return render_template("signin.html")


if __name__ == "__main__":
    app.run(debug=True)