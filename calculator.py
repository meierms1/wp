# Author: Maycon Meier 
# Source: https://en.wikipedia.org/wiki/Shear_modulus

# Description: Computes all property values for a given material

# Parameters: Provide at least 2 from K, G, E, lame, Poisson
# Attribuites: K, G, E, lame, Poisson, display, display_long
# Methods: UpdateAll, BulkModulus, YoungModulus, LameFirst, ShearModulus, vPoisson

# Usage: from material import material; variable_name = material(K = num1, G = num2); variable_name.display

import numpy as np


import numpy as np

def tests():
    var1 = 'BTU./lb'
    var2 = 'kJ./kg'
    coef = 2.326

    var1 = 'BTU./lb'
    var2 = 'kcal./kg' 
    coef = 0.5559

    var1 = 'psi'
    var2 = 'N./mm**2'
    coef = 6.895e-3

    var1 = 'degC./W'
    var2 = 'degF.hr./BTU'
    coef = 0.5275

    var1 = 'm./m./degC' 
    var2 = 'in./in./degF'
    coef = 0.5556

    var1 = 'BTU./ft**2./hr./degF'
    var2 = 'kcal./m**2./hr./degC'
    coef = 4.882


def main(value, iunit, ounit):
    ivar = iunit.split('.')
    ovar = ounit.split('.')
    
    ivar_new = []
    ovar_new = []

    for i in ivar:
        ivar_new.extend(Simplify(i))

    for i in ovar:
        ovar_new.extend(Simplify(i))
       
    factor = 1
    constant_list = ['Holdkgf','Holdozf','Holdcal','Holdcal15','Holdcal20','HoldBTU','Holderg','Holdhp', 'Holdbhp', 'Holdehp', 'Holdshp', 'Holdacre', 'Holdbarn', 'Holdha']

    for i,j in zip(ivar_new, ovar_new):
        mod1 = False; mod2 = True; g1 = ''; g2 = '';
        
        if i.count('/') == 1:
            ii = i.replace('/', '')
            mod1 = True
            g1 = '/'
            
        else: ii = i
            
        if ii in constant_list:
            pp, _ = MetrixPrefix(ii, mod1)
            factor = factor * pp
            ivar_new.remove(g1 + ii)
            
        if j.count('/') == 1:
            jj = j.replace('/', '')
            mod2 = False
            g2 = '/'
            
        else: jj = j
        
        if jj in constant_list:  
            pp, _ = MetrixPrefix(jj, mod2)
            factor = factor*pp
            ovar_new.remove(g2 + jj)
            

    m1, m2, m3 = UnitMatch(ivar_new, ovar_new)
    
    if m1 == False:
        print(ivar_new)
        print(ovar_new)
        raise ValueError('These Units dont match')
    
    if m2 == 2:
        ivar_new, ovar_new = rebalance(ivar_new, ovar_new, m3)
        
    print(ivar_new)
    print(ovar_new)
    for i,j in zip(ivar_new, ovar_new):
        factor = factor * allocator(i,j,value)

    return value * factor

def rebalance(ivar, ovar, m):
    
    v1 = m[0][0] + m[1][0] - m[2][0] - m[3][0]
    v2 = m[0][1] + m[1][1] - m[2][1] - m[3][1]
    v3 = m[0][2] + m[1][2] - m[2][2] - m[3][2]
    v4 = m[0][3] + m[1][3] - m[2][3] - m[3][3]
    v5 = m[0][4] + m[1][4] - m[2][4] - m[3][4]
    v6 = m[0][5] + m[1][5] - m[2][5] - m[3][5]
    
    if v1 > 0:
        for i in range(int(abs(v1)/2)):
            ovar.extend(['m','/m'])
    else:
        for i in range(int(abs(v1)/2)):
            ivar.extend(['m','/m'])
            
    if v2 > 0:
        for i in range(int(abs(v2)/2)):
            ovar.extend(['g','/g'])
    else:
        for i in range(int(abs(v2)/2)):
            ivar.extend(['g','/g'])
            
    if v3 > 0:
        for i in range(int(abs(v3)/2)):
            ovar.extend(['K','/K'])
    else:
        for i in range(int(abs(v3)/2)):
            ivar.extend(['K','/K'])
            
    if v4 > 0:
        for i in range(int(abs(v4)/2)):
            ovar.extend(['s','/s'])
    else:
        for i in range(int(abs(v4)/2)):
            ivar.extend(['s','/s'])
            
    if v5 > 0:
        for i in range(int(abs(v5)/2)):
            ovar.extend(['A','/A'])
    else:
        for i in range(int(abs(v5)/2)):
            ivar.extend(['A','/A'])
            
    if v6 > 0:
        for i in range(int(abs(v6)/2)):
            ovar.extend(['','/'])
    else:
        for i in range(int(abs(v6)/2)):
            ivar.extend(['','/'])
             
    return ivar, ovar

def Simplify(var):
    if var.count('/') == 1:
        mod = True
        var = var.replace('/', '')
    elif var.count('/') > 1:
        raise ValueError("Bad Input, too many /")
    else:
        mod = False
    
    
    power_list = ['W', 'hp', 'bhp', 'ehp', 'shp']
    power_base = ['kg.m**2./s**3', 'Holdhp.kg.m**2./s**3', 'Holdbhp.kg.m**2./s**3', 'Holdehp.kg.m**2./s**3', 'Holdshp.kg.m**2./s**3'] 
    energy_list = ['J', 'cal', 'cal15', 'cal20', 'BTU', 'erg']
    energy_base = ['kg.m**2./s**2', 'Holdcal.kg.m**2./s**2', 'Holdcal15.kg.m**2./s**2', 'Holdcal20.kg.m**2./s**2', 'HoldBTU.kg.m**2./s**2', 'Holderg.kg.m**2./s**2'] 
    electric_list = ['V', 'ohm', 'F','C','H','Wh']
    electric_base = ['kg.m**2./s**3./A', 'kg.m**2./s**3./A**2','/kg./m**2.s**4.A**2','A.s','kg.m**2./s**2.A**2','W.hour']
    pressure_list = ['Pa', 'psi', 'psf', 'bar', 'atm', 'at', 'Torr', 'mmHg','cmHg','inHg','ftHg','ksi','ksf'] #can add water ft and mm
    pressure_base = ['kg.m./s**2./m**2','slug.ft./s**2./in**2','slug.ft./s**2./ft**2','Gg.m./s**2./m**2','','','','','','','','kslug.ft./s**2./in**2','kslug.ft./s**2./ft**2'] 
    force_list = ['N', 'kip', 'lbf', 'ozf', 'kgf'] 
    force_base = ['kg.m./s**2', 'kslug.ft./s**2','slug.ft./s**2','Holdozf.slug.ft./s**2','Holdkgf.kg.m./s**2']
    other_list = ['knot', 'acre', 'barn', 'ha', 'angstorm']
    other_base = ['nmile./hour', 'Holdacre.m**2', 'Holdbarn.m**2', 'Holdha.m**2', 'nm.dm']

    unit_list = power_list + energy_list + pressure_list + force_list + electric_list
    base_units = power_base + energy_base + pressure_base + force_base + electric_base

    if var in unit_list: 
        if mod == False:
            return UnitSplit(base_units[unit_list.index(var)])
        else:
            return flip_function(UnitSplit(base_units[unit_list.index(var)]))
    
    else:
        if mod == False:
            return UnitSplit(var) 
        else:
            return flip_function(UnitSplit(var))
    
def flip_function(var):
    nvar = []
    for i in var:
        if i.count('/') == True:
            j = i.replace('/', '')
            nvar.append(j)
        else:
            j = '/' + i
            nvar.append(j)
    #print(nvar)
    return nvar
    
def UnitSplit(nvar):
    nvar = nvar.split('.')
    n_var = []
    for var in nvar:
        k = is_exp(var)
        if k != 1:
            var = var.split('**')
            for i in range(int(k)):
                n_var.append(var[0])
        else:
            n_var.append(var)
    #print(n_var)
    return n_var

def MetrixPrefix(var, inv):
    
    prefix_list = ['Y', 'Z', 'E', 'P', 'T', 'G', 'M', 'k', 'h', 'da', 'd', 'c', 'mi', 'mc', 'n', 'p', 'f', 'a','z','yo'] 
    prefix_names = ['Yotta', 'Zetta', 'Exa', 'Peta', 'Terra', 'Giga', 'Mega', 'kilo', 'hecto', 'daca', 'deci', 'centi', 'mili', 'micro', 'nano', 'pico', 'femto', 'atto','zepto','yocto']
    prefix_value = [1e24, 1e21, 1e18, 1e15, 1e12, 1e9, 1e6, 1e3, 1e2, 1e1,1e-1,1e-2,1e-3,1e-6,1e-9, 1e-12, 1e-15, 1e-18, 1e-21, 1e-24]

    std_list = ['Holdkgf','Holdozf','Holdcal','Holdcal15','Holdcal20','HoldBTU','Holderg','Holdhp', 'Holdbhp', 'Holdehp', 'Holdshp', 'Holdacre', 'Holdbarn', 'Holdha']
    std_value = [9.80665, 0.0625, 4.184,4.1855,4.182,1054.35,1e-7,735.49875,745.69987, 746, 9812.5, 4046.87261, 1e-28, 1e4]

    if len(var) > 1:
        if var[0] == 'd':
            if var[1] == 'a':
                var = 'da'
            elif var[1] == 'e':
                var = var
            else: 
                var = 'd'
        elif var[0] == 'm':
            if var[1] == 'i' and len(var) > 2:
                if var[2] != 'n':
                    var = 'mi'
            elif var[1] == 'c':
                var = 'mc'
            else: 
                var = 'mi'
        elif var[0] == 'y':
            if var[1] == 'o':
                var = 'yo'
        elif var[0] == 'f':
            if var[1] == 't':
                var = 'ft'
            else:
                var = 'f'
        elif len(var) > 3 and var[0] == 'H' and var[1] == 'o' and var[2] == 'l' and var[3] == 'd':
            var = var 
        else: 
            var = var[0]

    if var in prefix_list: 
        param = prefix_value[prefix_list.index(var)]
        hold = 1
    elif var in std_list:
        param = std_value[std_list.index(var)]
        hold = 0
    else: 
        param = 1
        hold = 0

    if inv == True:
        param = 1 / param 

    if hold == 1: return param, var 
    return param, ''

def UnitMatch(ivar, ovar):
    
    #if not ivar.count('.') == 0:
    #    ivar = ivar.split('.')
    #else:
    #    ivar = ivar.split()
    #    
    #if not ovar.count('.') == 0:
    #    ovar = ovar.split('.')
    #else:
    #    ovar = ovar.split()
        
    
    #ToDo
    cat1 = ['m', 'in', 'ft', 'mile', 'nmile', 'yd'] 
    cat2 = ['g', 'tone', 'ton', 'ukton', 'oz', 'lb', 'stone', 'slug'] 
    cat3 = ['K','R','degC','degF',] 
    cat4 = ['s', 'min', 'hr', 'day', 'week', 'month', 'year']
    cat5 = ['A', 'el']
    cat6 = []
    cat7 = ['Holdkgf','Holdozf','Holdcal','Holdcal15','Holdcal20','HoldBTU','Holderg','Holdhp', 'Holdbhp', 'Holdehp', 'Holdshp', 'Holdacre', 'Holdbarn', 'Holdha']


    ivar_num = [0,0,0,0,0,0]
    ivar_den = [0,0,0,0,0,0]
    ovar_num = [0,0,0,0,0,0]
    ovar_den = [0,0,0,0,0,0] 

    for i in ivar:
        if i.count('/') == 0: 
            if i in cat1:
                ivar_num[0] = ivar_num[0] + 1
            elif i in cat2:
                ivar_num[1] = ivar_num[1] + 1
            elif i in cat3:
                ivar_num[2] = ivar_num[2] + 1
            elif i in cat4:
                ivar_num[3] = ivar_num[3] + 1
            elif i in cat5:
                ivar_num[4] = ivar_num[4] + 1
            elif i in cat6:
                ivar_num[5] = ivar_num[5] + 1
        else:    
            i = i.replace('/', '') 
            if i in cat1:
                ivar_den[0] = ivar_den[0] + 1
            elif i in cat2:
                ivar_den[1] = ivar_den[1] + 1
            elif i in cat3:
                ivar_den[2] = ivar_den[2] + 1
            elif i in cat4:
                ivar_den[3] = ivar_den[3] + 1
            elif i in cat5:
                ivar_den[4] = ivar_den[4] + 1
            elif i in cat6:
                ivar_den[5] = ivar_den[5] + 1
                
    for i in ovar:
        if i.count('/') == 1:
            ii = i.replace('/', '')    
            if ii in cat1:
                ovar_den[0] = ovar_den[0] + 1
            elif ii in cat2:
                ovar_den[1] = ovar_den[1] + 1
            elif ii in cat3:
                ovar_den[2] = ovar_den[2] + 1
            elif ii in cat4:
                ovar_den[3] = ovar_den[3] + 1
            elif ii in cat5:
                ovar_den[4] = ovar_den[4] + 1
            elif ii in cat6:
                ovar_den[5] = ovar_den[5] + 1
                
        elif (i.count('/') == 0):
            ii = i
            if ii in cat1:
                ovar_num[0] = ovar_num[0] + 1
            elif ii in cat2:
                ovar_num[1] = ovar_num[1] + 1
            elif ii in cat3:
                ovar_num[2] = ovar_num[2] + 1
            elif ii in cat4:
                ovar_num[3] = ovar_num[3] + 1
            elif ii in cat5:
                ovar_num[4] = ovar_num[4] + 1
            elif ii in cat6:
                ovar_num[5] = ovar_num[5] + 1   
                 
    
    if ivar_den == ovar_den and ivar_num == ovar_num:
        return True, 1, []
    
    in_num = [0,0,0,0,0,0]; out_num =[0,0,0,0,0,0]; 

    for i in range(6):
        in_num[i] = ivar_num[i] - ivar_den[i]
        out_num[i] = ovar_num[i] - ovar_den[i]
        
    if (out_num == in_num):
        return True, 2, [ivar_num, ivar_den, ovar_num, ovar_den]
    
    return False, 0, []

def is_under(var):
    if var.count('/') == 1:
        return True
    if var.count('/') > 1:
        raise ValueError('Bad Input')
    else:
        return False

def is_exp(var):
    if var.count('**') >= 1:
        exp_find = var.split('**')
        k = exp_find[1]
        return float(k)
    else:
        return 1

def GetParam(input_, output, fun, mod, lev, value):
    if fun == 'length':
        conv_rate = UnityType().Length(input_, output)
    elif fun == 'mass':
        conv_rate = UnityType().Mass(input_, output)
    elif fun == 'temperature':
        conv_rate = UnityType(value).Temperature(input_, output)
    elif fun == 'time':
        conv_rate = UnityType().Time(ivar = input_, ovar = output)
    elif fun == 'charge':
        conv_rate = UnityType().Chemestry(input_, output)
    elif fun == 'chemestry':
        conv_rate = UnityType().Chemestry(input_, output)
    else: 
        raise ValueError('This class is not listed')

    if mod == 1:
        conv_rate = 1 / conv_rate

    param = (conv_rate)**lev

    return param

def _category(var, mod, k):
    if mod == 1:
        if k == 1:
            var = var.replace('/', '')
        else:
            var = var.replace('/', '')
            v_hold = var.split('**')
            var = v_hold[0]
    elif k != 1:
        v_hold = var.split('**')
        var = v_hold[0]

    cat1 = ['m', 'in', 'ft', 'mile', 'nmile', 'yd'] 
    cat2 = ['g', 'tone', 'ton', 'ukton', 'oz', 'lb', 'stone', 'slug'] 
    cat3 = ['K','R','degC','degF',] 
    cat4 = ['s', 'min', 'hr', 'day', 'week', 'month', 'year']
    cat5 = ['A', 'el']
    cat6 = []
    cat7 = ['Holdkgf','Holdozf','Holdcal','Holdcal15','Holdcal20','HoldBTU','Holderg','Holdhp', 'Holdbhp', 'Holdehp', 'Holdshp', 'Holdacre', 'Holdbarn', 'Holdha']

    if var in cat1:
        return 'length', var
    elif var in cat2:
        return 'mass', var
    elif var in cat3:
        return 'temperature', var
    elif var in cat4:
        return 'time', var
    elif var in cat5:
        return 'charge', var
    elif var in cat6:
        return 'chemestry', var
    elif var in cat7:
        return '', var
    else:
        #print(var)
        raise ValueError('Invalid Unit')

def UnitCheck(v1, v2):
    if v1 == v2:
        return True
    else:
        return False
    
def allocator(invar, outvar, value):
    if invar == outvar:
        return 1.0
    
    k = is_exp(invar)

    if is_under(invar) == True:
        invar = invar.replace('/', '')
        mod = True
    else:
        mod = False
    
    if is_under(outvar) == True:
        outvar = outvar.replace('/', '')
        mod2 = False
    else:
        mod2 = True 
        
    par1, v1 = MetrixPrefix(invar, mod)
    par2, v2 = MetrixPrefix(outvar, mod2)

    
    invar = invar.replace(v1, '')
    outvar = outvar.replace(v2, '')
    
    input_type, n_input = _category(invar, mod, k)
    output_type, n_output = _category(outvar, mod, k)
    UCheck = UnitCheck(input_type, output_type) 

    if UCheck == True:
        param = GetParam(input_=n_input, output = n_output, fun = input_type, mod=mod, lev = k, value=value)
        return param * par1 * par2
    else:
        return False

class UnityType:
    def __init__(self, value):
        self.value = value 
        
    def Length(self, ivar, ovar):
        if(ivar == "m"):
            meter = 1
            inches = 39.3701
            foot = 3.28084
            mile = 0.00621371
            yard = 1.09361
            nauticmile = 0.000539957
            
        elif(ivar == "in"):
            meter = 0.0254
            inches = 1
            foot = 0.083333
            mile = 1.5783e-5
            yard = 0.0277778
            nauticmile = 1.3715e-5
            
        elif(ivar == "ft"):
            meter = 0.3048
            inches = 12
            foot = 1
            mile = 0.000189394
            yard = 1/3
            nauticmile = 0.000164579
            
        elif(ivar == "yd"):
            meter = 0.9144
            inches = 36
            foot = 3
            mile = 0.000568182
            yard = 1
            nauticmile = 0.000493737
            
        elif(ivar == "mile"):
            meter = 1609.34
            inches = 63360
            foot = 5280
            mile = 1
            yard = 1760
            nauticmile = 0.868976   
            
        elif(ivar == "nmile"):
            meter = 1852
            inches = 72913.4
            foot = 6076.12
            mile = 1.15078
            yard = 2025.37
            nauticmile = 1
            
        else:
            raise ValueError("input unit not listed")
        
        if(ovar == "m"): param = meter
        elif(ovar == 'in'): param = inches
        elif(ovar == 'ft'): param = foot 
        elif(ovar == 'mile'): param = mile 
        elif(ovar == 'yd'): param = yard
        elif(ovar == 'nmile'):param = nauticmile
        else: raise ValueError("output unit not listed") 
        
        return param
    
    def Mass(self, ivar, ovar):
        if (ivar == 'g'):
            g = 1
            slug = 6.8522e-5
            stone = 0.000157473
            tone = 1e-6
            lb = 0.00220462
            oz = 0.035274
            ton = 1.1023e-6
            ukton = 9.8421e-7
            
        elif (ivar == 'slug'):
            g = 14593.9
            slug = 1
            stone = 2.29815
            tone = 0.01459639
            lb = 32.174
            oz = 514.785
            ton = 0.016087
            ukton = 0.0143634
            
        elif (ivar == 'stone'):
            g = 6350.29
            slug = 0.435133
            stone = 1
            tone = 0.00635029
            lb = 0.0625
            oz = 224
            ton = 0.007
            ukton = 2.7902e-5

        elif (ivar == 'tone'):
            g = 1e6
            slug = 68.5218
            stone = 157.473
            tone = 1
            lb = 2204.62
            oz = 35274
            ton = 1.10231
            ukton = 0.984207
          
        elif (ivar == 'lb'):
            g = 453.592
            slug = 0.031081
            stone = 0.0714286
            tone = 0.000453592
            lb = 1
            oz = 16
            ton = 0.0005
            ukton = 0.000446429
            
        elif (ivar == 'oz'):
            g = 28.3495
            slug = 0.00194256
            stone = 0.00446429
            tone = 2.835e-5
            lb = 0.0625
            oz = 1
            ton = 3.125e-5
            ukton = 2.7902e-5
            
        elif (ivar == 'ton'):
            g = 907185
            slug = 62.1619
            stone = 142.857
            tone = 0.907185
            lb = 2000
            oz = 32000
            ton = 1
            ukton = 0.892857
            
        elif (ivar == 'ukton'):
            g = 1.016e6
            slug = 69.6213
            stone = 160
            tone = 1.01605
            lb = 2240
            oz = 35840
            ton = 1.12
            ukton = 1
            

        if(ovar == "g"): param = g
        elif(ovar == 'tone'): param = tone
        elif(ovar == 'lb'): param = lb 
        elif(ovar == 'oz'): param = oz 
        elif(ovar == 'ton'): param = ton
        elif(ovar == 'ukton'):param = ukton
        elif(ovar == 'slug'): param = slug
        elif(ovar == 'stone'): param = stone
        else: raise ValueError("output unit not listed")

        return param 
        
    def Time(self, ivar, ovar):
        if ivar == 's':
            second = 1
            minute = 1 / 60
            hour = minute / 60
            day = hour / 24 
            week = day / 7
            month = day / 30 
            year = 1 / 3.171e-8
        
        elif ivar == 'min':
            second = 60
            minute = 1 
            hour = minute / 60
            day = hour / 24 
            week = day / 7
            month = day / 30 
            year = 1 / 525600
        
        elif ivar == 'hr':
            second = 60 * 60 
            minute = 60
            hour = 1 
            day = 1 / 24
            week = day / 7
            month = day / 30
            year =  1 / 8760
        
        elif ivar == 'day':
            second = 60 * 60 * 24
            minute = 60 * 24
            hour = 24
            day = 1
            week = day / 7
            month = day / 30 
            year = 1 / 365
    
        elif ivar == 'week':
            second = 60 * 60 * 24 * 7
            minute = 60 * 24 * 7
            hour = 24 * 7 
            day = 7
            week = day / 7
            month = day / 30
            year = 52
        
        elif ivar == 'month':
            second = 60 * 60 * 24 * 30
            minute = second / 60
            hour = minute / 60
            day = hour / 24
            week = day / 7
            month = day / 30
            year = 12

        elif ivar == 'year':
            second = 60 * 60 * 24 * 30 * 365 
            minute = second / 60
            hour = minute / 60
            day = hour / 24
            week = day / 7
            month = day / 30
            year = 1

         

        if ovar == 's': param = second
        elif ovar == 'min': param = minute
        elif ovar == 'hr': param = hour 
        elif ovar == 'day': param = day
        elif ovar == 'week': param = week  
        elif ovar == 'month': param = month
        elif ovar == 'year': param = year 

        return param 
    
    def Temperature(self, ivar, ovar):
        if(ivar == "degC"):
            if(ovar == "K"):
                temp = self.value + 273.15
            elif(ovar == "degF"):
                temp = self.value * (9 / 5) + 32
            elif(ovar == 'R'):
                temp = (self.value * 9 / 5 + 32) - 459.67
            else: raise ValueError("temperature output not listed")
        
        elif(ivar == "K"):
            if(ovar == "degC"):
                temp = self.value - 273.15
            elif(ovar == "degF"):
                temp = (self.value - 273.15) * 9 / 5 + 32
            elif(ovar == 'R'):
                temp = (self.value * 9 / 5)
            else: raise ValueError("temperature output not listed")
        
        elif(ivar == "degF"):
            if(ovar == "degC"):
                temp = (self.value - 32) * 5  / 9
            elif(ovar == "K"):
                temp = (self.value - 32) * 5  / 9 + 273.15
            elif(ovar == 'R'):
                temp = (self.value - 459.67)
            else: raise ValueError("temperature output not listed")

        elif(ivar == "R"):
            if(ovar == "degC"):
                temp = (self.value * 5 / 9 ) + 273.15
            elif(ovar == 'degF'):
                temp = self.value + 459.67
            elif(ovar == 'K'):
                temp = self.value * 5 / 9
            else:
                raise ValueError("temperature output not listed")

        else: raise ValueError("temperature input unit not listed")
        
        return temp 
    
    def Charge(self, ivar, ovar):
        if(ivar == 'A'):
            A = 1
            el = 6.241e18

        elif(ivar == 'el'):
            A = (1/6.241e18)
            el = 1
            
        else: raise ValueError("Charge Unit Not Listed")

        if ovar == 'A': return A
        elif ovar == 'el': return el
        else: raise ValueError('Charge unit not listed')
        

    def Chemestry(self):
        return
    
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
            self.converted_value = self.Time()
        elif compute_key == 3:
            self.converted_value = self.Temperature()
        elif compute_key == 4:
            self.converted_value = self.Charge()
        elif compute_key == 5:
            self.converted_value = self.Chemestry()

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
                self.out_var = self.in_value * (9 / 5) + 32
            elif(self.out_var == 'R'):
                self.out_var = (self.in_value * 9 / 5 + 32) - 459.67
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
        if self.in_var in temp: return "temp"
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