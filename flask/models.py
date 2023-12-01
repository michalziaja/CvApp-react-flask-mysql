from flask_sqlalchemy import SQLAlchemy
from uuid import uuid4
from flask_marshmallow import Marshmallow
import datetime

db = SQLAlchemy()
ma = Marshmallow()

def get_uuid():
    return uuid4().hex

class UserData(db.Model):
    __tablename__ = 'data'
    cv = db.Column(db.Integer, primary_key=True)
    job = db.Column(db.String(255), nullable=False)
    company = db.Column(db.String(255), nullable=False)
    date = db.Column(db.Date, default=datetime.datetime.now)
    expire = db.Column(db.Date)
    url = db.Column(db.String(100), nullable=False)
    rejected = db.Column(db.Boolean)
    user_id = db.Column(db.String(32), db.ForeignKey('users.id'), nullable=False)
    
    def __init__(self, job, company, user_id, expire, url):  
        self.job = job
        self.company = company
        self.user_id = user_id  
        self.expire = expire
        self.url = url


class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.String(32), primary_key=True, default=get_uuid)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    user_data = db.relationship('UserData', backref='user')
    
    def __init__(self, email, password):
        self.email = email
        self.password = password




class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User

class UserDataSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = UserData



user_schema = UserSchema()
users_schema = UserSchema(many=True)
user_data_schema = UserDataSchema()
user_data_list_schema = UserDataSchema(many=True)
