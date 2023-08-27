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
    return "hello"

@app.route("/about/")
def about():
    return render_template("about.html")

@app.route("/resume/")
def resume():
    return render_template("resume.html")

@app.route("/tools/")
def tools():
    return render_template("tools.html")

@app.route("/Links/")
def links():
    return render_template("links.html")

if __name__ == "__main__":
    app.run(debug=True)