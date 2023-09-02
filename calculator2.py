import numpy as np


class GeneralConverter():
    def __init__(value, input_unit, output_unit):
        self.value = value
        input_prefix = [] 
        output_prefix = []
        input = [] 
        output = [] 
        
        for i in input_unit.split('.'):
            if i in prefix_:
                input_prefix.append(i)
            else:
                input.append(i)
        for i in output_unit.split('.'):
            if i in prefix_:
                output_prefix.append(i)
            else:
                output.append(i)

        input = logical_sort(simplify(input))
        output = logical_sort(simplify(output))

        if len(output) != len(input):
            raise ValueError("Input and Output units are not equivalent")
        
        if not _assert(intput, output):
            raise ValueError("Input and Output units are not equivalent")
        
        ratio = 1.0
        for i,j in zip(input, output):
            hold = BaseConverter(i,j)
            param = hold.ratio
            ratio = ratio * param
        for i in input_prefix:
            ratio = ratio*_handler(i)
        for i in output_prefix:
            ratio = ratio*_handler(i)

    
    def simplify():
        pass

    def _handler(prefix:str):
        prefix_list = {'Y':1.0e24,'Z':1.0e21,'E':1.0e18,'P':1.0e15,'T':1.0e12,'G':1.0e9,'M':1.0e6,'k':1.0e3,'h':1.0e2,'da':1.0e1,
                       'd':1.0e-1,'c':1.0e-2,'mi':1.0e-3,'mc':1.0e-6,'n':1.0e-9,'p':1.0e-12,'f':1.0e-15,'a':1.0e-18,'z':1.0e-21,'yo':1.0e-24,
                       'Holdkgf':9.80665,'Holdozf':0.0625,'Holdcal':4.184,'Holdcal15':4.1855,'Holdcal20':4.182,'HoldBTU':1054.35,'Holderg':1e-7,'Holdhp':735.49875, 
                       'Holdbhp':745.69987,'Holdehp':746,'Holdshp':9812.5,'Holdacre':4046.87261, 'Holdbarn':1e-28, 'Holdha':1e4}
        prefix_names = ['Yotta', 'Zetta', 'Exa', 'Peta', 'Terra', 'Giga', 'Mega', 'kilo', 'hecto', 'daca', 'deci', 'centi', 'mili', 'micro', 'nano', 'pico', 'femto', 'atto','zepto','yocto']}

        param=prefix_list[prefix]

        return param

    def _assert(input, output) -> bool:
        return True
    
    def is_under():
        pass

    def is_exp():
        pass

    def logical_sort():
        pass

class BaseConverter:
    def __init__(self, value:float, in_unit:str, out_unit:str, select_key="none"):
        self.in_value = value
        self.in_var = in_unit
        self.out_var = out_unit
        select={"lenght":0, "mass":1, "time":2, "temp":3, "charge":4, "chem":5}
        if select_key == "none":
            select_key = self.get_type()
        compute_key = select[select_key]
        if compute_key == 0:
            self.converted_value = self.Lenght()
        elif compute_key == 1: 
            self.converted_value = self.Mass()
        elif compute_key == 2:
            self.converted_value == self.Time()
        elif compute_key == 3:
            self.converted_value == self.Temperature()
        elif compute_key == 4:
            self.converted_value == self.Charge()
        elif compute_key == 5:
            self.converted_value == self.Chemestry()

    def Mass(self):
        select={"g":0,"slug":1,"stone":2,"tone":3,"lb":4,"oz":5,"ton":6,"ukton":7}
        ratio_table=[[1,6.8522e-5,0.000157473,1e-6,0.00220462,0.035274,1.1023e-6,9.8421e-7],
                     [14593.9,1,2.29815,0.01459639,32.174,514.785,0.016087,0.0143634,],
                     [6350.29,0.435133,1,0.00635029,0.0625,224,0.007,2.7902e-5,],
                     [1e6,68.5218,157.473,1,2204.62,35274,1.10231,0.984207,],
                     [453.592,0.031081,0.0714286,0.000453592,1,16,0.0005,0.000446429],
                     [28.3495,0.00194256,0.00446429,2.835e-5,0.0625,1,3.125e-5,2.7902e-5],
                     [907185,62.1619,142.857,0.907185,2000,32000,1,0.892857],
                     [1.016e6,69.6213,160,1.01605,2240,35840,1.12,1]]
        i = select[self.in_var]
        j = select[self.out_var]
        self.ratio = ratio_table[i][j]
        return self.value * ratio_table[i][j]

    def Lenght(self):
        select={"m":0,"in":1,"ft":2,"yd":3,"mile":4,"nmile":5}
        ratio_table = [[1,39.3701,3.28084,1.09361,0.00621371,0.000539957],
                       [0.0254,1,0.083333,0.0277778,1.5783e-5,1.3715e-5],
                       [0.3048,12,1,1/3,0.0018934,0.000164579],
                       [0.9144,36,3,1,0.000568182,0.000493737],
                       [1609.34,63360,5280,1760,1,0.868976],
                       [1852,72913.4, 6076.12, 1.15078, 2025.37, 1]]
        i=select[self.in_var]
        j=select[self.out_var]
        self.ratio = ratio_table[i][j]
        return self.value * ratio_table[i][j]

    def Time(self):        
        select = {'s': 0,"min": 1,"hr": 2,"day": 3,"week": 4,"month": 5,"year": 6}        
        ratio_table = [
            [1, 1/60, 1/60/60, 1/60/60/24, 1/60/60/24/7 ,1/60/60/24/30, 1/3.171e-8],
            [60, 1, 1/60, 1/60/24, 1/60/24/7, 1/60/24/30, 1/525600],
            [60*60, 60, 1, 1/24, 1/24/7, 1/24/30, 1/8760],
            [60 * 60 * 24, 60 * 24, 24, 1, 1/7, 1/30, 1/365],
            [60*60*24*7,60*24*7,24*7,7,1,1/4,1/52],
            [60*60*24*30, 60*24*30, 24*30, 30, 4, 1, 1/12],
            [60*60*24*365, 60*24*365, 24*365, 365, 52, 12, 1],
            ]
        i = select[self.in_var]
        j = select[self.out_var] 
        self.ratio = ratio_table[i][j]      
        return self.value * ratio_table[i][j]

    def Temperature(self):
        if(self.in_var == "degC"):
            if(self.out_var == "K"):
                temp = self.value + 273.15
            elif(self.out_var == "degF"):
                self.out_var = self.value * (9 / 5) + 32
            elif(ovar == 'R'):
                self.out_var = (self.value * 9 / 5 + 32) - 459.67
            else: raise ValueError("temperature output not listed")
        
        elif(self.in_var == "K"):
            if(self.out_var == "degC"):
                temp = self.value - 273.15
            elif(self.out_var == "degF"):
                temp = (self.value - 273.15) * 9 / 5 + 32
            elif(self.out_var == 'R'):
                temp = (self.value * 9 / 5)
            else: raise ValueError("temperature output not listed")
        
        elif(self.in_var == "degF"):
            if(self.out_var == "degC"):
                temp = (self.value - 32) * 5  / 9
            elif(self.out_var == "K"):
                temp = (self.value - 32) * 5  / 9 + 273.15
            elif(self.out_var == 'R'):
                temp = (self.value - 459.67)
            else: raise ValueError("temperature output not listed")

        elif(self.in_var == "R"):
            if(self.out_var == "degC"):
                temp = (self.value * 5 / 9 ) + 273.15
            elif(self.out_var == 'degF'):
                temp = self.value + 459.67
            elif(self.out_var == 'K'):
                temp = self.value * 5 / 9
            else:
                raise ValueError("temperature output not listed")

        else: raise ValueError("temperature input unit not listed")
        
        return temp

    def Charge(self):
        select={"A":0, "el":1}
        ratio_table=[[1,6.241e18],[1/6.241e18,1]]
        i=select[self.in_var]
        j=select[self.out_var]
        self.ratio = ratio_table[i][j]
        return self.value * ratio_table[i][j]

    def Chemestry(self):
        pass

    def get_type(self):
        l = ["m","in","ft","yd","mile","nmile"]
        m = ["g","slug","stone","tone","lb","oz","ton","ukton"]
        t = ['s',"min","hr","day","week","month","year"] 
        temp = ["degC", 'degF','K',"R"] 
        c = ["A","el"] 
        chem = [] 
        if self.in_var in l: return "lenght"
        if self.in_var in m: return "mass"
        if self.in_var in t: return "time"
        if self.in_var in temp: return "temp"
        if self.in_var in c: return "charge"
        if self.in_var in chem: return "chem"


class NumberType:
    def __init__(self, Value, outform = "sci" ):
        self.Value = Value
        if outform == "sci":
            self.ScientificNotation()
        elif outform == "real":
            self.RealNumber()
        else: 
            raise ValueError("Option not listed")
    
    def ScientificNotation(self):
        raise ValueError("{self.Value:.2e}")
            
    def RealNumber(self):
        raise ValueError("{self.Value:.6f}")