#!/usr/bin/python
# -*- coding: utf-8 -*-

import os
import sys
import shutil
from sys import argv

base_path=os.path.abspath( os.path.join( __file__ ,"../" ) )

def rm(path):
    if  os.path.exists(  path) :
            print("delete path:" + path)
            shutil.rmtree( path )

def cp(fromPath,toPath):
    if os.path.exists(toPath) :
        shutil.rmtree(toPath)

    shutil.copytree(fromPath,toPath)
    print(fromPath + " ---> " + toPath)

def mycp(source,toPath):
    cp( os.path.join(source,"lib"), os.path.join(toPath ,"inline-res-loader/lib"))
    cp( os.path.join(source,"src"), os.path.join(toPath ,"inline-res-loader/src"))
    shutil.copyfile( os.path.join( source,"package.json"), os.path.join(toPath ,"inline-res-loader/package.json"))

if __name__=='__main__':
    target = os.path.abspath( argv[1] )

    print("源地址："+ base_path + " ---> 目标地址：" + target)
    print("-----------------------------------")
    target = os.path.abspath(os.path.join( target , "node_modules") )

    if not os.path.exists( target  ):
        print("找不到 " + target + " 文件夹，请检查目标文件夹")
        sys.exit(1)

    rm( os.path.abspath(os.path.join( base_path , "lib") ))
    os.system(("npm --prefix=%s run build" ) % ( base_path ) )
    print("-----------------------------------")

    mycp(base_path,target)

    print("完成")


