#!/usr/bin/python
# -*- coding: utf-8 -*-

import os
import sys
import shutil
from sys import argv
import getpass

user_name = getpass.getuser()
print(user_name)

def getWorkPath():
    return os.path.abspath( os.path.join( __file__ ,"../" ) )

def rm(path):
    if  os.path.exists( base_path + path) :
            print(base_path + path)
            shutil.rmtree(base_path + path )

def cp(fromPath,toPath):
    if os.path.exists(toPath) :
        shutil.rmtree(toPath)

    shutil.copytree(fromPath,toPath)
    print(fromPath + " ---> " + toPath)

def mycp(source,toPath):
    cp( os.path.join( source,"lib"), os.path.join(toPath ,"node_modules/libjv/lib"))
    cp( os.path.join( source,"src"), os.path.join(toPath ,"node_modules/libjv/src"))
    # shutil.copyfile( os.path.join( source,"package.json"), os.path.join(toPath ,"node_modules/libjv/package.json"))

if __name__=='__main__':
    base_path = getWorkPath()
    os.chdir(base_path)

    target = "C:\\users\\" + user_name + "\\AppData\\Roaming\\npm\\"

    os.system(("python ./libjv/copy.py %s" ) % ( target ) )
    os.system(("python ./element-ui-ext/copy.py %s" ) % ( target ) )
    os.system(("python ./element-webpart/copy.py %s" ) % ( target ) )



