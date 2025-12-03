import os

from flask import Flask,request,jsonify

from dotenv import load_dotenv

from flask_pymongo import PyMongo

from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required, JWTManager

from flask_cors import CORS

from werkzeug.security import generate_password_hash, check_password_hash

from datetime import timedelta
load_dotenv()

app = Flask(__name__)
# Setup the Flask-JWT-Extended extension
app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY")  # Change this!
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=7) #Login Required in every 7 days
jwt = JWTManager(app)

app.config["MONGO_URI"] = os.environ.get("MONGO_URI")
mongo = PyMongo(app)

CORS(app)
@app.route("/signup", methods=["POST"])
def register():
    statAdmin={"totalQuizzes": 0,"Total Participants": 0,"Avg Quizzes (per Year)":0,"MM Quiz made":0}
    statStudent={"totalQuizzes": 0,"avgScore": 0,"bestScore": 0,"attempts": 0}
    userCred = request.json
    user = mongo.db.users.find_one({"username":userCred["username"]})
    if not user:
        hashed_password = generate_password_hash(userCred["password"])
        mongo.db.users.insert_one({
            "userType":userCred["userType"],
            "name":userCred["name"],
            "username":userCred["username"],
            "password":hashed_password,
            "Quizzes":[],
            "stats": statAdmin if userCred["userType"]=="admin" else statStudent
        })
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
    
@app.route("/profile",methods=["GET"])
@jwt_required()
def profile():
    currUser = get_jwt_identity()
    user = mongo.db.users.find_one({"username":currUser})
    if not user:
        return jsonify({
            "message":"User Not Found"
        }),404
    return jsonify({
        "message":"Profile Found",
        "user":{
            "name":user["name"],
            "username":user["username"],
            "userType":user["userType"],
            "stats":user["stats"]
        }
    })

@app.route("/edit-profile",methods=["POST"])
@jwt_required()
def editProfile():
    currUser=get_jwt_identity()
    data = request.json

    user = mongo.db.users.update_one({"username":data["username"]},{"$set":{"name":data["name"]}})
    if not user:
        return jsonify(message="User Not Found")
    return jsonify(message="Changes Updated Successfully.")

@app.route("/change-password",methods=["POST"])
@jwt_required()
def changePass():
    currUser=get_jwt_identity()
    data = request.json
    hashed_password = generate_password_hash(data["newPass"])
    user = mongo.db.users.find_one({"username":data["username"]})
    if not user:
        return jsonify(message="User Not Found")
    if check_password_hash(user["password"],data["oldPass"]):
        user = mongo.db.users.update_one({"username":data["username"]},{"$set":{"password":hashed_password}})
        return jsonify(message="Password Changed Successfully.")
    return jsonify(message="Old Password is Wrong.")

if __name__ == "__main__":
    app.run(port=5001,debug=True)