import os

from flask import Flask,request,jsonify

from dotenv import load_dotenv

from flask_pymongo import PyMongo

from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required, JWTManager

from flask_cors import CORS

from werkzeug.security import generate_password_hash, check_password_hash

load_dotenv()

app = Flask(__name__)

# Setup the Flask-JWT-Extended extension
app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY")  # Change this!
jwt = JWTManager(app)

app.config["MONGO_URI"] = os.environ.get("MONGO_URI")
mongo = PyMongo(app)

CORS(app)
@app.route("/signup", methods=["POST"])
def register():
    userCred = request.json
    user = mongo.db.users.find_one({"username":userCred["username"]})
    if not user:
        hashed_password = generate_password_hash(userCred["password"])
        userCred["password"]=hashed_password
        mongo.db.users.insert_one(userCred)
        return jsonify(message="User Registered Successfully");
    else:
        return jsonify(message="User Already Exist.")

@app.route("/login",methods=["POST"])
def login():
    data = request.json
    user = mongo.db.users.find_one({"username":data["username"]})

    if not user or not check_password_hash(user["password"],data["password"]) or user["userType"]!=data["userType"]:
        return jsonify({
            "message":"Username or password is invalid."
        })
    access_token = create_access_token(identity=data["username"])
    print(access_token)
    return jsonify(message="User Found",access_token=access_token)
    

if __name__ == "__main__":
    app.run(port=5001,debug=True)