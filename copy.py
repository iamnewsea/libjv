#!/usr/bin/python
# -*- coding: utf-8 -*-

import os
import sys
import shutil

base_path =  os.path.abspath( os.path.join( __file__ ,"../" ) ) +"/"

print(base_path);
os.chdir( base_path )

def rm(path):
    if  os.path.exists( base_path + path) :
            print(base_path + path)
            shutil.rmtree(base_path + path )

if __name__=='__main__':
    os.system('''npm run compile''')
    print("-----------------------------------")
    os.system('''cp lib ../app.shop.html/corp/node_modules/libjv -R''')
    os.system('''cp lib ../app.shop.html/admin/node_modules/libjv -R''')


    os.system('''cp index.js ../app.shop.html/admin/node_modules/libjv/ ''')
    os.system('''cp index.js ../app.shop.html/admin/node_modules/libjv/ ''')

    print("完成")


