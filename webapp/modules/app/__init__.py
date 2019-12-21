
''' flask app with mongo '''
import os
import json
import datetime
from bson.objectid import ObjectId
from flask import Flask
from flask_pymongo import PyMongo
from dotenv import load_dotenv
dotenv_path = os.path.join(os.getenv('ROOT_PATH'), '.env')
load_dotenv(dotenv_path)

class JSONEncoder(json.JSONEncoder):
    ''' extend json-encoder class'''

    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        if isinstance(o, datetime.datetime):
            return str(o)
        return json.JSONEncoder.default(self, o)

template_dir = os.path.dirname(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))
template_dir = os.path.join(template_dir, 'modules/app/dist')
static_dir = os.path.dirname(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))
static_dir = os.path.join(static_dir, 'modules/app/dist/assets')
print(template_dir)
# create the flask object
app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)

# add mongo url to flask config, so that flask_pymongo can use it to make connection
# print(os.getenv('DB'))
app.config['MONGO_URI'] = os.getenv('DB')
mongo = PyMongo(app)

# use the modified encoder class to handle ObjectId & datetime object while jsonifying the response.
app.json_encoder = JSONEncoder

from app.controllers import *