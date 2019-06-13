#!/usr/bin/python
# -*- coding: utf-8 -*-

import os
import sys
import shutil
from sys import argv

base_path =  os.path.abspath( os.path.join( __file__ ,"../" ) ) +"/"

os.chdir( base_path )
print("当前文件夹" + base_path);

def rm(path):
    if  os.path.exists( base_path + path) :
            print(base_path + path)
            shutil.rmtree(base_path + path )

def cp(fromPath,toPath):
  if os.path.exists(toPath) :
        shutil.rmtree(toPath)

  shutil.copytree(fromPath,toPath)

def mycp(toPath):
      cp("lib", toPath +"/node_modules/libjv/lib")
      cp("src", toPath +"/node_modules/libjv/src")
      shutil.copyfile("index.js",toPath +"/node_modules/libjv/index.js")

if __name__=='__main__':
    os.system('''npm run build''')
    print("-----------------------------------")

    print(argv[1]);
    mycp(argv[1])

    print("完成")


