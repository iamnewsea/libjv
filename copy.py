#!/usr/bin/python
# -*- coding: utf-8 -*-

import os
import sys
import shutil

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

if __name__=='__main__':
    os.system('''npm run compile''')
    print("-----------------------------------")

    cp("lib","../app.shop.html/corp/node_modules/libjv/lib")
    cp("lib","../app.shop.html/admin/node_modules/libjv/lib")

    shutil.copyfile("index.js","../app.shop.html/corp/node_modules/libjv/index.js")
    shutil.copyfile("index.js","../app.shop.html/admin/node_modules/libjv/index.js")

    print("完成")


