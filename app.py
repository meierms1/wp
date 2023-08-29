import numpy as np
import pandas as pd
import requests as r
import xlsxwriter as x
import math 

from apitk import IEX_CLOUD_API_TOKEN

from flask import Flask, render_template, requests

app=Flask(__name__)

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
    if (user_on_mobile()): return render_template("resume2.html")
    return render_template("resume.html")

@app.route("/finance/")
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
    app.run(debug=False, host="0.0.0.0", port = 5000)