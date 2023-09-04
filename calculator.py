# Author: Maycon Meier 
# Source: https://en.wikipedia.org/wiki/Shear_modulus

# Description: Computes all property values for a given material

# Parameters: Provide at least 2 from K, G, E, lame, Poisson
# Attribuites: K, G, E, lame, Poisson, display, display_long
# Methods: UpdateAll, BulkModulus, YoungModulus, LameFirst, ShearModulus, vPoisson

# Usage: from material import material; variable_name = material(K = num1, G = num2); variable_name.display

import numpy as np

class GeneralConverter():
    def __init__(self, value, input_unit, output_unit):

        self.value = value
        ratio = 1.0
        
        input_unit=input_unit.split(".")
        output_unit=output_unit.split(".")

        if len(input_unit) == 1 and len(output_unit) == 1:
            simple_temperature=["degC","K","degF","R"]
            if input_unit[0] in simple_temperature and output_unit[0] in simple_temperature:
                self.converted_value = BaseConverter(self.value,input_unit[0],output_unit[0], select_key="temp",temp_control=False).Temperature()
                return 

        _input, param_input = self.simplify(input_unit)
        _output, param_output = self.simplify(output_unit)
        ratio = ratio * param_input / param_output


        input_prefix = [] 
        output_prefix = []
        input_ = [] 
        output_ = [] 
        
        prefix_ = ['Y','Z','E','P','T','G','M','k','h','da','d','c','mi','mc','n','p','f','a','z','yo']

        for i in _input:
            j = i
            if "/" in i: j=i.replace("/","")
            if j in prefix_:
                input_prefix.append(i)
            else:
                input_.append(i)

        for i in _output:
            j = i
            if "/" in i: j=i.replace("/","")
            if j in prefix_:
                output_prefix.append(i)
            else:
                output_.append(i)

        input_, output_ = self.remove_redundants(input_, output_)
        _input = self.logical_sort(input_)
        _output = self.logical_sort(output_)

        if len(_output) != len(_input):
            #print(input_unit)
            #print(output_unit)
            #print(_input)
            #print(_output)
            print("Attempting to swap messy units")
            if len(_input)>len(_output):
                _input, _ratio = self.LastCall(_input)
            else:
                _output, _ratio = self.LastCall(_output)
            _input, _output = self.remove_redundants(_input,_output)
            if len(_output) != len(_input):
                raise ValueError("Input and Output units are not equivalent")
            ratio = ratio * _ratio
            _input = self.logical_sort(_input)
            _output = self.logical_sort(_output)
        
        if not self._assert(_input, _output):
            raise ValueError("Input and Output units are not equivalent")
        
        for i,j in zip(_input, _output):
            k=i; l=j; kk = False; ll = False
            if "/" in i: k = i.replace("/",""); kk = True
            if "/" in j: l = j.replace("/",""); ll = True
            hold = BaseConverter(1,k,l)
            if kk == True and ll == True:
                param = 1 / hold.ratio
            else:
                param = hold.ratio
            ratio = ratio * param
        for i in input_prefix:
            k=i; kk = False; 
            if "/" in i: k = i.replace("/",""); kk = True
            if kk == True:
                ratio = ratio/self._handler(k)
            else:
                ratio = ratio*self._handler(k)
        
        for i in output_prefix:
            k=i; kk = False; 
            if "/" in i: k = i.replace("/",""); kk = True
            if kk == True:
                ratio = ratio*self._handler(k)
            else:
                ratio = ratio/self._handler(k)
            

        self.ratio = ratio
        self.converted_value = self.value * ratio
    
    def simplify(self, list_to_simplify:list):
        prefix = ['Y','Z','E','P','T','G','M','k','h','da','d','c','mi','mc','n','p','f','a','z','yo']
        select = {"N":"kg.m./s./s", "Hz":"/s","Wb":"m.m.kg./s./s./A",
                  "T":"kg./s./s./A", "W":"kg.m.m./s./s./s","Pa":"kg./m./s./s",
                  "J":"m.m.k.g./s./s", "C":"A.s", "F":"A.A.s.s.s.s.m.m./kg",
                  "S":"s.s.s.A.A./kg./m./m","Gy":"m.m./s./s","H":"m.m.kg./s./s./A./A",
                  "V":"m.m.kg./s./s./s./A","Ohm":"m.m.kg./s./s./s./A./A",
                  "lx":"cd.sr./m./m","lm":"cd.sr", "Bq":"/s",
                  "bar":"a1.Pa", "atm":"a2.Pa","mH2O":"a3.Pa","ftH2O":"a4.psi",
                   "mmHg":"a5.Pa", "inHg":"a6.psi",
                   "psi":"lbi./in./s./s", "lbf":"a11.lb.ft./s./s","lbi":"a17.a11.lb","psf":"lbf./ft./ft",
                   "gallon":"a7.in.in.in", "quart":"a8.in.in.in","pint":"a9.in.in.in","floz":"a10.in.in.in",
                   "kip":"a12.lbf","L":"a13.m.m.m", "Liter":"a13.m.m.m",
                   "tbsp":"a14.floz", "tsp":"a15.tbsp",
                   "mph":"mile./hr", "kph":"km./hr",
                   "MPa":"M.Pa", "kPa":"k.Pa", "GPa":"G.Pa", "kN":"k.N","kJ":"k.J",
                   "mm":"mi.m","cm":"c.m","km":"k.m","kg":"k.g",
                   "BTU":"e1.J","IT":"e2.J", "BTUc":"e3.J", "BTUt":"e4.J", "BTUcal":"e5.J",
                   "hp":"e6.W", "ccf":"M.J", "cal":"c1.J", "calt":"c2.J", "cal4":"c3.J", "cal15":"c4.J", "cal20":"c5.J"
                    , "calmean":"c6.J", "calit":"c7.J", "toneTNT":"e6.G.J", "TNT":"e6.G.J./ton", "eV":"e7.J"}
        conv = {"a1":1.0e5, "a2":101325,"a3":9806.4,"a4":0.4335,"a5":133.32,"a6":0.4911,
                "a16":277.42, "a7":69.355,"a8":34.677,"a9":8.6694,"a10":1.7339,"a11":32.174049,
                "a12":1000,"a13":0.001, "a14":0.5, "a15":1/3, "a17":12,
                "e1":1054.8, "e2":1055.06,"e3":1054.68,"e4":1054.35,"e5":1059.67,"e6":4.184,"e7":1.602176634e-19,
                "c1":4.1868, "c2":4.184, "c3":4.204, "c4":4.1855, "c5":4.182, "c6":4.190, "c7":4.1868}
        
        increments = []
        for i in list_to_simplify:
            if "**" in i:
                j = i.split("**")
                if int(j[1]) > 10: raise ValueError("Exponents are too large. Stopping here for security.")
                for k in range(int(j[1])):
                    increments.append(j[0])
                list_to_simplify.pop(list_to_simplify.index(i))
        list_to_simplify = list_to_simplify + increments
        
        check = 0
        while check < 5:
            hold_list = [] 
            
            for i in list_to_simplify:
                j = i
                hold = False
                if "/" in i: 
                    j = i.replace("/","")
                    hold = True
                if j in select:
                    if hold == True:
                        var = select[j]
                        var = var.replace(".", "./")
                        hold_list.append("/"+var)
                    else:
                        hold_list.append(select[j])
                else:
                    hold_list.append(i)
            
            for i in hold_list:
                var = i.split(".")
                hold_list.pop(hold_list.index(i))
                for j in var:
                    hold_list.append(j)
            list_to_simplify = hold_list
            check += 1
            #list_to_simplify = hold_list
            
        hold_list = []
        param = 1
        for i in list_to_simplify:              
            j = i
            inverse = False
            if "/" in i: 
                j = i.replace("/","")
                inverse = True
            if j in conv and inverse==False:
                param = param*conv[j]
            elif j in conv and inverse==True:
                param = param/conv[j]
            else:
                hold_list.append(i)

        list_to_simplify=hold_list

        return list_to_simplify, float(param)

    def _handler(self,prefix:str):
        prefix_list = {'Y':1.0e24,'Z':1.0e21,'E':1.0e18,'P':1.0e15,'T':1.0e12,'G':1.0e9,'M':1.0e6,'k':1.0e3,'h':1.0e2,'da':1.0e1,
                       'd':1.0e-1,'c':1.0e-2,'mi':1.0e-3,'mc':1.0e-6,'n':1.0e-9,'p':1.0e-12,'f':1.0e-15,'a':1.0e-18,'z':1.0e-21,'yo':1.0e-24,
                       'Holdkgf':9.80665,'Holdozf':0.0625,'Holdcal':4.184,'Holdcal15':4.1855,'Holdcal20':4.182,'HoldBTU':1054.35,'Holderg':1e-7,'Holdhp':735.49875, 
                       'Holdbhp':745.69987,'Holdehp':746,'Holdshp':9812.5,'Holdacre':4046.87261, 'Holdbarn':1e-28, 'Holdha':1e4}
        prefix_names = ['Yotta', 'Zetta', 'Exa', 'Peta', 'Terra', 'Giga', 'Mega', 'kilo', 'hecto', 'daca', 'deci', 'centi', 'mili', 'micro', 'nano', 'pico', 'femto', 'atto','zepto','yocto']

        param=prefix_list[prefix]

        return param

    def _assert(self,input, output) -> bool:
        return True
    
    def remove_redundants(self,in_list:list, out_list:list):
        in_hold = []; out_hold = []

        for i in in_list:
            if "/" in i:
                j = i.replace("/","")
                if j in in_list:
                    in_hold.append(i)
                    in_hold.append(j)
                    in_list.pop(in_list.index(i))
                    in_list.pop(in_list.index(j))
        for i in out_list:
            if "/" in i:
                j = i.replace("/","")
                if j in out_list:
                    out_hold.append(i)
                    out_hold.append(j)
                    out_list.pop(out_list.index(i))
                    out_list.pop(out_list.index(j))  

        if len(in_list) == len(out_list):            
            return in_list, out_list
        elif len(in_list) > len(out_list):
            diff = abs(len(in_list) - len(out_list))
            if diff%2:  raise ValueError("Input and Output units are not equivalent")
            c = 0
            while c < diff:
                try:
                    out_list.append(out_hold[c])
                    c += 1 
                except:
                    c += 1           
            return in_list, out_list
        elif len(in_list) < len(out_list):
            diff = abs(len(in_list) - len(out_list))
            if diff%2:  raise ValueError("Input and Output units are not equivalent")
            c = 0
            while c < diff:                
                try:
                    in_list.append(in_hold[c])
                    c += 1 
                except:
                    c += 1 
            return in_list, out_list
        raise ValueError("Input and Output units are not equivalent")

    def logical_sort(self,list_to_sort:list) -> list:
        list_lenght = [];list_mass=[]; list_time = []; list_temp = [] ;list_charge = []; list_chem = [] 
        l = ["m","in","ft","yd","mile","nmile"]
        m = ["g","slug","stone","tone","lb","oz","ton","ukton"]
        t = ['s',"min","hr","day","week","month","year"] 
        temp = ["degC", 'degF','K',"R"] 
        c = ["A","el"] 
        chem = ["not coded"] 
        for i in list_to_sort:
            j = i
            if "/" in i: j = i.replace("/","")
            
            if j in l: list_lenght.append(i)
            if j in m: list_mass.append(i)
            if j in t: list_time.append(i)
            if j in temp: list_temp.append(i)
            if j in c: list_charge.append(i)
            if j in chem: list_chem.append(i)

        list_ = []
        list_lenght.sort()
        list_mass.sort()
        list_temp.sort()
        list_time.sort()
        list_charge.sort()
        list_chem.sort()
        if len(list_lenght) > 0: 
            for i in list_lenght: 
                list_.append(i)
        if len(list_mass) > 0: 
            for i in list_mass: 
                list_.append(i)
        if len(list_time) > 0: 
            for i in list_time: 
                list_.append(i)
        if len(list_temp) > 0: 
            for i in list_temp: 
                list_.append(i)
        if len(list_charge) > 0: 
            for i in list_charge: 
                list_.append(i)
        if len(list_chem) > 0: 
            for i in list_chem: 
                list_.append(i)

        return list_

    def LastCall(self, _input:list):
        ratio = 1
        for i in _input:
            if "/" in i:
                tp = self.get_type(i.replace("/", ""))
                print(f"testing {i}")
                for j in _input:
                    if "/" not in j:
                        print(f"testing match {j}")
                        op = self.get_type(j)
                        if not i.replace("/","") == j:
                            if op == tp:
                                print(f"found {i} and {j}")
                                print("Swaping variables")
                                ratio = ratio * BaseConverter(1, i.replace("/",""), j).ratio
                                _input.pop(_input.index(j))
                                _input.append(i.replace("/",""))
                                print("Success! ")
                                return _input, ratio
        print("Failed to find swaps, redirecting and shutting down")
        return _input, ratio
    
    def get_type(self, var):
        l = ["m","in","ft","yd","mile","nmile"]
        m = ["g","slug","stone","tone","lb","oz","ton","ukton"]
        t = ['s',"min","hr","day","week","month","year"] 
        temp = ["degC", 'degF','K',"R"] 
        c = ["A","el"] 
        chem = [] 
        if var in l: return "lenght"
        if var in m: return "mass"
        if var in t: return "time"
        if var in temp: return "temp"
        if var in c: return "charge"
        if var in chem: return "chem"
    
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

class BaseConverter:
    def __init__(self, value:float, in_unit:str, out_unit:str, select_key:str="none", temp_control:bool=True):
        self.in_value = value
        self.in_var = in_unit
        self.out_var = out_unit
        self.temp_control = temp_control
        select={"lenght":0, "mass":1, "time":2, "temp":3, "charge":4, "chem":5,"temp_variance":6}
        if select_key == "none":
            select_key = self.get_type()
        compute_key = select[select_key]
        if compute_key == 0:
            self.converted_value = self.Lenght()
        elif compute_key == 1: 
            self.converted_value = self.Mass()
        elif compute_key == 2:
            self.converted_value = self.Time()
        elif compute_key == 3:
            self.converted_value = self.Temperature()
        elif compute_key == 4:
            self.converted_value = self.Charge()
        elif compute_key == 5:
            self.converted_value = self.Chemestry()
        elif compute_key == 6:
            self.converted_value = self.Temperature_variance()

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
        return self.in_value * ratio_table[i][j]

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
        return self.in_value * ratio_table[i][j]

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
        return self.in_value * ratio_table[i][j]

    def Temperature(self):
        if(self.in_var == "degC"):
            if(self.out_var == "K"):
                temp = self.in_value + 273.15
            elif(self.out_var == "degF"):
                temp = self.in_value * (9 / 5) + 32
            elif(self.out_var == 'R'):
                temp = (self.in_value * 9 / 5 + 32) - 459.67
            else: raise ValueError("temperature output not listed")
        
        elif(self.in_var == "K"):
            if(self.out_var == "degC"):
                temp = self.in_value - 273.15
            elif(self.out_var == "degF"):
                temp = (self.in_value - 273.15) * 9 / 5 + 32
            elif(self.out_var == 'R'):
                temp = (self.in_value * 9 / 5)
            else: raise ValueError("temperature output not listed")
        
        elif(self.in_var == "degF"):
            if(self.out_var == "degC"):
                temp = (self.in_value - 32) * 5  / 9
            elif(self.out_var == "K"):
                temp = (self.in_value - 32) * 5  / 9 + 273.15
            elif(self.out_var == 'R'):
                temp = (self.in_value - 459.67)
            else: raise ValueError("temperature output not listed")

        elif(self.in_var == "R"):
            if(self.out_var == "degC"):
                temp = (self.value * 5 / 9 ) + 273.15
            elif(self.out_var == 'degF'):
                temp = self.in_value + 459.67
            elif(self.out_var == 'K'):
                temp = self.in_value * 5 / 9
            else:
                raise ValueError("temperature output not listed")

        else: raise ValueError("temperature input unit not listed")
        
        return temp

    def Temperature_variance(self):
        select={"degC":0,"K":1,"degF":2,"R":3}
        ratio_table=[[1,     1, 1.8, 1.8],
                     [1,     1, 1.8, 1.8],
                     [0.5556, 0.5556, 1,   1],
                     [0.5556, 0.556, 1,   1]]
        i=select[self.in_var]
        j=select[self.out_var]
        self.ratio = ratio_table[i][j]
        return self.in_value * ratio_table[i][j]

    def Charge(self):
        select={"A":0, "el":1}
        ratio_table=[[1,6.241e18],[1/6.241e18,1]]
        i=select[self.in_var]
        j=select[self.out_var]
        self.ratio = ratio_table[i][j]
        return self.in_value * ratio_table[i][j]

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
        if self.in_var in temp: 
            if self.temp_control == False:
                return "temp"
            else: 
                return "temp_variance"
        if self.in_var in c: return "charge"
        if self.in_var in chem: return "chem"

class material: 
    def __init__(self, K = -1, E = -1, lame = -1, G = -1, Poisson = -1):
        self.K = K
        self.E = E
        self.lame = lame 
        self.G = G
        self.Poisson = Poisson 

        count = 0
        for i in [self.K, self.E, self.lame, self.G, self.Poisson]:
            if i == -1:
                count += 1
        if count > 3:
            raise TypeError("Provide at least two property values from the list: (K, E, G, lame, Poisson)")

        self.var = ""
        if   (self.K >= 0):
            if   (self.E >= 0): self.var = "K,E"
            elif (self.lame >= 0): self.var = "K,lame"
            elif (self.G >= 0): self.var = "K,G"
            elif (self.Poisson >= 0): self.var = "K,Poisson"
        elif (self.E >= 0): 
            if   (self.lame >= 0): self.var = "E,lame"
            elif (self.G >= 0): self.var = "E,G"
            elif (self.Poisson >= 0): self.var = "E,Poisson"
        elif (self.lame >= 0):
            if   (self.G >= 0): self.var = "lame,G"
            elif (self.Poisson >= 0): self.var = "lame,Poisson"
        elif (self.G >= 0 and self.Poisson >= 0): self.var = "G,Poisson"
        else: raise TypeError("Wrong Input Parameters")

        self.UpdateAll()

        self.display = "Bulk Modulus = " + str(float("{:.2f}".format(self.K)))  + " | Young Modulus = " + str(float("{:.2f}".format(self.E))) + " | Shear Modulus = " + str(float("{:.2f}".format(self.G))) + " | Lame First Parameter = " + str(float("{:.2f}".format(self.lame))) + " | Poisson Coeficient = " + str(float("{:.2f}".format(self.Poisson)))
        self.display_long = "Bulk Modulus = " + str(self.K)  + " | Young Modulus = " + str(self.E) + " | Shear Modulus = " + str(self.G) + " | Lame First Parameter = " + str(self.lame) + " | Poisson Coeficient = " + str(self.Poisson)

    def UpdateAll(self):
        self.K = self.BulkModulus()
        self.E = self.YoungModulus()
        self.lame = self.LameFirst()
        self.G = self.ShearModulus()
        self.Poisson = self.vPoisson()
        return

    def BulkModulus(self):
        if (self.K != -1): return self.K

        if   (self.var == "E,lame"):
            R = np.sqrt(self.E ** 2 + 9.0 * self.lame ** 2 + 2.0 * self.E * self.lame)
            return (self.E + self.lame * 3.0 + R) / 6.0
        elif (self.var == "E,G"):
            return (self.E * self.G) / 3.0 / (3.0 * self.G - self.E)
        elif (self.var == "E,Poisson"):
            return self.E / 3.0 / (1.0 - 2.0 * self.Poisson)
        elif (self.var == "lame,G"): 
            return self.lame + ((2.0 * self.G) / 3.0) 
        elif (self.var == "lame,Poisson"): 
            return self.lame * (1.0 +self.Poisson) / (3.0 * self.Poisson)
        elif (self.var == "G,Poisson"):
            return 2.0 * self.G * (1.0 + self.Poisson) / 3.0 / (1.0 - 2.0 * self.Poisson)
        else: raise TypeError("Wrong Input Parameters")
    
    def YoungModulus(self):
        if (self.E != -1): return self.E 

        if   (self.var == "K,lame"):
            return 9.0 * self.K * (self.K - self.lame) / (3.0 * self.K - self.lame)
        elif (self.var == "K,G"):
            return 9.0 * self.K * self.G / (3.0 * self.K + self.G)
        elif (self.var == "K,Poisson"):
            return 3.0 * self.K * (1.0 - 2.0 * self.Poisson)
        elif (self.var == "lame,G"): 
            return self.G * (3.0 * self.lame + 2.0 * self.G) / (self.lame + self.G)
        elif (self.var == "lame,Poisson"): 
            return self.lame * (1.0 - self.Poisson) * (1.0 - 2.0 * self.Poisson) / self.Poisson
        elif (self.var == "G,Poisson"):
            return 2.0 * self.G * (1.0 + self.Poisson)
        else: raise TypeError("Wrong Input Parameters")
        
    def LameFirst(self):
        if (self.lame != -1): return self.lame

        if   (self.var == "K,E"):
            return 3.0 * self.K * (3.0 * self.K - self.E) / (9.0 * self.K - self.E)
        elif (self.var == "K,G"):
            return self.K - 2.0 * self.G / 3.0
        elif (self.var == "K,Poisson"):
            return 3.0 * self.K * self.Poisson / (1.0 + self.Poisson) 
        elif (self.var == "E,G"): 
            return self.G * (self.E - 2.0 * self.G) / (3.0 * self.G - self.E)
        elif (self.var == "E,Poisson"): 
            return self.E * self.Poisson / ((1.0 + self.Poisson) * (1.0 - 2.0 * self.Poisson))
        elif (self.var == "G,Poisson"):
            return 2.0 * self.G * self.Poisson / (1.0 - 2.0 * self.Poisson)
        else: raise TypeError("Wrong Input Parameters")
        
    def ShearModulus(self):
        if (self.G != -1): return self.G 

        if   (self.var == "K,E"):
            return 3.0 * self.K * self.E / (9.0 * self.K - self.E)
        elif (self.var == "K,lame"):
            return 3.0 * (self.K - self.lame) / 2.0
        elif (self.var == "K,Poisson"):
            return 3.0 * self.K * (1.0 - 2.0 * self.Poisson) / 2.0 / (1.0 + self.Poisson)
        elif (self.var == "E,lame"): 
            R = np.sqrt(self.E ** 2 + 9.0 * self.lame ** 2 + 2.0 * self.E * self.lame)
            return (self.E - 3.0 * self.lame + R) / 4.0 
        elif (self.var == "E,Poisson"): 
            return self.E / 2.0 / (1.0 + self.Poisson)
        elif (self.var == "lame,Poisson"):
            return self.lame * (1.0 - 2.0 * self.Poisson) / 2.0 / self.Poisson
        else: raise TypeError("Wrong Input Parameters")
        
    def vPoisson(self):
        if (self.Poisson != -1): return self.Poisson

        if   (self.var == "K,E"):
            return (3.0 * self.K - self.E) / 6.0 / self.K 
        elif (self.var == "K,lame"):
            return self.lame / (3.0 * self.K - self.lame)
        elif (self.var == "K,G"):
            return (3.0 * self.K - 2.0 * self.G) / 2.0 / (3.0 * self.K + self.G)
        elif (self.var == "E,lame"): 
            R = np.sqrt(self.E ** 2 + 9.0 * self.lame ** 2 + 2.0 * self.E * self.lame)
            return 2.0 * self.lame / (self.E + self.lame + R)
        elif (self.var == "E,G"): 
            return (self.E / 2.0 / self.G) - 1.0 
        elif (self.var == "lame,G"):
            return self.lame / 2.0 / (self.lame + self.G)
        else: raise TypeError("Wrong Input Parameters")

def tests():
    test1 = create_test_case(1,"m","m", 1, "meter to meter")
    test2 = create_test_case(1, "k.g","g", 1000, "kg to g")
    test3 = create_test_case(1, "MPa", "psi", 145.038, "MPa to psi")
    test4 = create_test_case(1, "G.g", "g", 1e9, "Giga gram to gram")
    test5 = create_test_case(20, "degC", "degF", 68, "Celsius to Fahre")
    test6 = create_test_case(20, "degC", "K", 293.15, "Celsius to Kelvin")
    test7 = create_test_case(10, "m.m./s", "ft.ft./min", 6458.35,"m2/s to ft2/min")
    test8 = create_test_case(1, 'psi', 'N./mm**2',  6.895e-3, "psi to n/mm2")

    var1 = 'BTU./lb'
    var2 = 'kJ./kg'
    coef = 2.326
    test9 = create_test_case(1, var1, var2, coef, "btu/lb to kj/kg")

    var1 = 'BTU./lb'
    var2 = 'k.cal./kg' 
    coef = 0.5559
    test10 = create_test_case(1, var1, var2, coef, "btu/lb to kcal/kg")

    var1 = "degC"
    var2 = "degF"
    coef = 68
    testt = create_test_case(20,var1,var2,coef,"simple temperature")

    var1 = 'degC./W'
    var2 = 'degF.hr./BTU'
    coef = 0.5275
    test11 = create_test_case(1, var1, var2, coef, f"{var1} ---> {var2}")

    var1 = 'm./m./degC' 
    var2 = 'in./in./degF'
    coef = 0.5556
    test12 = create_test_case(1, var1, var2, coef, f"{var1} ---> {var2}")

    var1 = 'BTU'
    var2 = 'k.cal'
    coef = 0.252164
    test13 = create_test_case(1, var1, var2, coef, f"{var1} ---> {var2}")

    var1 = './degC'
    var2 = './degF'
    coef = 0.5556
    test14 = create_test_case(1, var1, var2, coef, f"{var1} ---> {var2}")

    var1 = './degF'
    var2 = './degC'
    coef = 1.8
    test15 = create_test_case(1, var1, var2, coef, f"{var1} ---> {var2}")

    var1 = './K'
    var2 = './degF'
    coef = 0.5556
    test16 = create_test_case(1, var1, var2, coef, f"{var1} ---> {var2}")

    var1 = './R'
    var2 = './K'
    coef = 1.8
    test17 = create_test_case(1, var1, var2, coef, f"{var1} ---> {var2}")

    var1 = 'W./m./K'
    var2 = 'cal./s./cm./degC'
    coef = 0.00239
    test18 = create_test_case(1, var1, var2, coef, f"{var1} ---> {var2}")

    var1 = 'W./m./K'
    var2 = 'BTU./hr./ft./degF'
    coef = 0.578
    test19 = create_test_case(1, var1, var2, coef, f"{var1} ---> {var2}")

    var1 = 'BTU./ft**2./hr./degF'
    var2 = 'k.cal./m**2./hr./degC'
    coef = 4.882
    test20 = create_test_case(1, var1, var2, coef, f"{var1} ---> {var2}")

    var1 = 'W./m./K'
    var2 = 'BTU.in./hr./ft./ft./degF'
    coef = 6.94
    test21 = create_test_case(1, var1, var2, coef, f"{var1} ---> {var2}")


    tests_ = [test1, test2, test3, test4, test5, test6, test7, test8, test9, test10,test11, test12, test13,test14, test15,
              test16, test17, test18, test19, test20, test21,testt]
    j=1
    for i in tests_:
        perform_test(i, str(j))
        j += 1

    print("Completed")
    return 

def create_test_case(value:float, in_unit:str, out_unit:str, result:float, name:str) -> list:
    return [value, in_unit, out_unit, result, name]

def perform_test(list_:list, n:str) -> bool:
    print(f"Starting test number {n}")
    print(f"{list_[1]} ----> {list_[2]}")
    test = GeneralConverter(list_[0],list_[1],list_[2])
    if list_[3] > 0: 
        g = 2
    else: 
        g = 5
    if round(test.converted_value,g) == round(list_[3],g):
        print("Test "+ n + ":  -------------> Pass" )
        return True
    else:
        print("Test "+ n + ":  -------------> Failed" )
        print(str(round(test.converted_value, 5)) + " != " + str(round(list_[3],5)))
        return False

t = tests() 

#perform_test(create_test_case(1, "in.in./g", "m", 1, f"11"), "exception")