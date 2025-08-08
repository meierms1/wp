import numpy as np
from backend.calculator import GeneralConverter

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
    passed = 0
    failed = 0 
    for i in tests_:
        gg = perform_unit_test(i, str(j))
        if gg == True:
            passed += 1
        else:
            failed += 1 
        j += 1
    
    print("Completed")
    print(f"{passed} tests Pass and {failed} tests Failed")
    return failed

def create_test_case(value:float, in_unit:str, out_unit:str, result:float, name:str) -> list:
    return [value, in_unit, out_unit, result, name]

def perform_unit_test(list_:list, n:str) -> bool:
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

exit(tests())