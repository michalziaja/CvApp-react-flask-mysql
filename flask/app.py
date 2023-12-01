import json
from flask import Flask, request, jsonify
from datetime import datetime, timedelta, timezone
from flask_jwt_extended import create_access_token,get_jwt,get_jwt_identity, unset_jwt_cookies, jwt_required, JWTManager
from flask_bcrypt import Bcrypt 
from flask_cors import CORS, cross_origin
from flask_marshmallow import Marshmallow
from flask_sqlalchemy import SQLAlchemy
from models import db, User, UserData
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
import io
import base64
from selenium_stealth import stealth


app = Flask(__name__)
ma = Marshmallow(app)
cors = CORS(app)
CORS(app, supports_credentials=True)


app.config['SECRET_KEY'] = 'my-secret-key-for-cvapp'
app.config['CORS_HEADERS'] = 'Content-Type'
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:''@localhost/cvapp'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_POOL_TIMEOUT'] = 1000
app.config["SQLALCHEMY_POOL_RECYCLE"] = 3600
app.config['SQLALCHEMY_POOL_PRE_PING'] = True

app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
jwt = JWTManager(app)
 
bcrypt = Bcrypt(app)    
db.init_app(app)
  
with app.app_context():
    db.create_all()


# REGISTER NEW USER 

@app.route('/register', methods=["POST"])
@cross_origin()

def register():
    email = request.json["email"]
    password = request.json["password"]
   
    user_exists = User.query.filter_by(email=email).first() is not None
   
    if user_exists:
        return jsonify({"error": "Email already exists"}), 409
       
    hashed_password = bcrypt.generate_password_hash(password)
    new_user = User(email=email, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
   
    return jsonify({
        "message": "New user registered successfully"    
    })


# LOGIN USER

@app.route('/login', methods=["POST"])
@cross_origin()

def login():
    email = request.json.get("email", None)
    password = request.json.get("password", None)
  
    user = User.query.filter_by(email=email).first()
    
    if user is None:
        return jsonify({"error": "Wrong email or passwords"}), 401
      
    if not bcrypt.check_password_hash(user.password, password):
        return jsonify({"error": "Unauthorized"}), 401
      
    access_token = create_access_token(identity=email)
    
  
    return jsonify({
        "email": email,
        "access_token": access_token
        
    })
    


# GENERATE ACCESS TOKEN FOR USER

@app.after_request

def refresh_expiring_jwts(response):
    try:
        exp_timestamp = get_jwt()["exp"]
        now = datetime.now(timezone.utc)
        target_timestamp = datetime.timestamp(now + timedelta(minutes=30))
        if target_timestamp > exp_timestamp:
            access_token = create_access_token(identity=get_jwt_identity())
            data = response.get_json()
            if type(data) is dict:
                data["access_token"] = access_token 
                response.data = json.dumps(data)
        return response
    except (RuntimeError, KeyError):
        
        return response



# ADD NEW DATA FROM USER

@app.route('/add', methods=['POST'])
@cross_origin()
@jwt_required()

def add_data():
    try:
        current_user_email = get_jwt_identity()

        
        job = request.json['job']
        company = request.json['company']
        expire = request.json['expire']
        url = request.json['url']

        
        user = User.query.filter_by(email=current_user_email).first()
        if user is None:
            return jsonify({"error": "User not found"}), 404

        
        user_data = UserData(job=job, company=company, expire=expire, url=b"", user_id=user.id)

        
        db.session.add(user_data)
        db.session.commit()
        
        
        options = Options()
        #options.add_argument('--start-maximized')
        options.page_load_strategy = 'normal'
        options.add_argument("--headless=new")
        options.add_argument('--no-sandbox')
        options.add_argument("disable-infobars")
        options.add_argument("--enable-features=ReaderMode")
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option('useAutomationExtension', False)
        prefs = {"credentials_enable_service": False,
            "profile.password_manager_enabled": False}
        options.add_experimental_option("prefs", prefs)
        driver = webdriver.Chrome(options=options)
        
        stealth(driver,
        vendor="Google Inc.",
        platform="Win32",
        webgl_vendor="Intel Inc.",
        renderer="Intel Iris OpenGL Engine",
        fix_hairline=True,)
        
        #Submit cookies
        try:
            
            driver.get(url)

            if "pracuj" in url:
                try:
                    
                    WebDriverWait(driver, 1).until(EC.element_to_be_clickable((By.CSS_SELECTOR, 'button[data-test="button-submitCookie"]'))).click()
                except:
                    pass  
            elif "theprotocol" in url:
                try:
                    
                    WebDriverWait(driver, 1).until(EC.element_to_be_clickable((By.CSS_SELECTOR, 'button[data-test="button-acceptAll"]'))).click()
                except:
                    pass  
            elif "indeed" in url:
                try:
                    WebDriverWait(driver, 1).until(EC.element_to_be_clickable((By.ID, 'onetrust-accept-btn-handler'))).click()
                except:
                    pass
            
            time.sleep(1)
            total_height = driver.execute_script("return document.body.scrollHeight")
            time.sleep(1)
            target_height = max(total_height, 2500)
            driver.set_window_size(1920, target_height)

            

        except Exception as e:
            print("Error:", e)

        finally:
            # Capture screenshot
            screenshot_path = "screenshot.png"
            driver.save_screenshot(screenshot_path)

            with io.open(screenshot_path, 'rb') as screenshot:
                screenshot_data = screenshot.read()

            user_data.url = screenshot_data
            db.session.commit()

            driver.quit()

        return jsonify({"message": "Data added successfully!"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500




# LIST ALL DATA FROM USER 

@app.route('/list', methods=['GET'])
@cross_origin()
@jwt_required()

def list():
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()

    if user is None:
        return jsonify({"error": "User not found"}), 404

    user_data_list = UserData.query.filter_by(user_id=user.id).all()
    user_list = []

    for user_data in user_data_list:
        user_data_entry = {
            "cv": user_data.cv,
            "job": user_data.job,
            "company": user_data.company,
            "expire": user_data.expire,
            "date": user_data.date,
            "rejected": user_data.rejected,
            "url": base64.b64encode(user_data.url).decode("utf-8") if user_data.url else None
        }

        user_list.append(user_data_entry)

    return jsonify(user_list)



#VIEW DETAILS DATA

@app.route('/view/<data_cv>', methods=['GET'])
@cross_origin()
@jwt_required()

def listcv(data_cv):
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()

    if user is None:
        return jsonify({"error": "User not found"}), 404

    user_data = UserData.query.filter_by(cv=data_cv, user_id=user.id).first()

    if user_data is None:
        return jsonify({"error": "User data not found"}), 404

    user_data_entry = {
        "cv": user_data.cv,
        "job": user_data.job,
        "company": user_data.company,
        "date": user_data.date,
        "expire": user_data.expire,
        "url": base64.b64encode(user_data.url).decode("utf-8"),
        "user_id": user_data.user_id
    }

    return jsonify(user_data_entry)



#DELETE USER DATA

@app.route("/delete/<data_cv>", methods=["DELETE"])
@cross_origin()
@jwt_required()

def delete(data_cv):
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()

    if user is None:
        return jsonify({"error": "User not found"}), 404

    user_data = UserData.query.filter_by(cv=data_cv, user_id=user.id).first()
    
    if user_data is None:
        return jsonify({"error": "User data not found"}), 404
    
    db.session.delete(user_data)
    db.session.commit()
   
    return jsonify({"message": "Data deleted successfully"})


# UPDATE USER DATA

@app.route('/update/<data_cv>', methods=["PUT"])
@cross_origin()
@jwt_required()

def update(data_cv):
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()
    
    if user is None:
        return jsonify({"error": "User not found"}), 404

    user_data = UserData.query.filter_by(cv=data_cv, user_id=user.id).first()
    
    if user is None:
        return jsonify({"error": "User not found"}), 404


    job = request.json['job']
    user_data.job = job
    company = request.json['company']
    user_data.company = company
    expire = request.json['expire']
    user_data.expire = expire

    db.session.commit()
    return jsonify({"message": "Data updated successfully"})

# UPDATE USER DATA (REJECTED)

@app.route('/updatecv/<data_cv>', methods=["PUT"])
@cross_origin()
@jwt_required()

def updatecv(data_cv):
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()
    
    if user is None:
        return jsonify({"error": "User not found"}), 404

    user_data = UserData.query.filter_by(cv=data_cv, user_id=user.id).first()
    
    if user is None:
        return jsonify({"error": "User not found"}), 404


    rejected = request.json['rejected']
    user_data.rejected = rejected

    db.session.commit()
    return jsonify({"message": "Data updated successfully"})



# LOGOUT USER 

@app.route("/logout", methods=["POST"])

def logout():
    response = jsonify({"msg": "logout successful"})
    unset_jwt_cookies(response)
    return response


if __name__ == "__main__":  
    app.run(debug=True, host="0.0.0.0", port=5000)


