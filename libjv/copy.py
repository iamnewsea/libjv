#!/usr/bin/python
# -*- coding: utf-8 -*-

import os
import sys
import shutil
from sys import argv


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
    shutil.copyfile( os.path.join( source,"package.json"), os.path.join(toPath ,"node_modules/libjv/package.json"))

if __name__=='__main__':
    source = os.path.abspath( os.path.join( __file__ ,"../" ) )
    target = os.path.abspath( argv[1] )
    print("源地址："+ source + " ---> 目标地址：" + target)
    print("-----------------------------------")

    if not os.path.exists( target + "/node_modules"):
        print("找不到 node_modules 文件夹，请检查目标文件夹")
        sys.exit(1)

    os.system(("npm --prefix=%s run build" ) % ( source ) )
    print("-----------------------------------")

    mycp(source,target)

    print("完成")


