import os

from flask import Flask,request,jsonify

from dotenv import load_dotenv

from flask_pymongo import PyMongo

from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required, JWTManager

from flask_cors import CORS

from werkzeug.security import generate_password_hash, check_password_hash

from bson import ObjectId

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

def removeQuestions(questions):
    for q in questions:
        qDB = mongo.db.questions
        ques = qDB.find_one({"_id":ObjectId(q)})
        ques["askedIn"]-=1
        qDB.delete_one({"_id":ObjectId(q)})
        if ques["askedIn"]>0:
            qDB.insert_one(ques)

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

    user = mongo.db.users.update_one({"username":currUser},{"$set":{"name":data["name"]}})
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

@app.route("/add-questions", methods=["POST"])
@jwt_required()
def addQuestion():
    questions = []
    data = request.get_json() or []
    for ques in data:
        doc = {
            "askedIn": 1,
            "type": ques.get("type"),
            "text": ques.get("text"),
            "options": ques.get("options") if ques.get("type") == "mcq" else [],
            "subject":None,
            "tag":None
        }
        if ques.get("type") == "mcq":
            doc["correctIndex"] = ques.get("correctIndex")
        else:
            doc["correctInteger"] = ques.get("correctInteger")
        res = mongo.db.questions.insert_one(doc)
        questions.append(str(res.inserted_id))

    return jsonify(message="Questions Added Successfully", questions=questions)

@app.route("/create-quiz",methods=["POST"])
@jwt_required()
def createQuiz():
    currUser=get_jwt_identity()
    data=request.json
    try:
        #Admin Check
        for admin in data["quizDetails"]["adminIds"]:
            isPresent = mongo.db.users.find_one({"username":admin})
            if not isPresent:
                removeQuestions(data["questions"])
                return jsonify(message="Admin Id's doesn't exist")
        
        if currUser not in data["quizDetails"]["adminIds"]:
            data["quizDetails"]["adminIds"].append(currUser)

        #Unique Quiz ID Check
        isExist=mongo.db.quizzes.find_one({"quizDetails.quizId":data["quizDetails"]["quizId"]})
        if isExist:
            removeQuestions(data["questions"])
            return jsonify(message="Quiz ID already exist.")

        res = mongo.db.quizzes.insert_one(data)
        for admin in data["quizDetails"]["adminIds"]:
            mongo.db.users.update_one({"username":admin},
            {
                "$inc":{"stats.totalQuizzes":1},
                "$push":{"Quizzes":data["quizDetails"]["quizId"]},
                "$max":{"stats.MM Quiz made":data["quizDetails"]["totalMarks"]}
            })
        result={
            "quizID":data["quizDetails"]["quizId"]
        }
        mongo.db.quizResults.insert_one(result)
        return jsonify(message="Quiz Created Successfully.")
    except:
        return jsonify(message="An Error Occured.")

@app.route('/quiz/<quizID>',methods=["GET"])
@jwt_required()
def quiz(quizID):
    try:
        qz = mongo.db.quizzes.find_one({"quizDetails.quizId":quizID})
        if not qz:
            return jsonify(message="Quiz Doesn't Exist")
        ques = []
        for q in qz["questions"]:
            qu=mongo.db.questions.find_one({"_id":ObjectId(q)})
            qu["_id"]=str(qu["_id"])
            ques.append(qu)
        return jsonify(message="Quiz Found",quizDetails=qz["quizDetails"],questions=ques)
    except:
        return jsonify(message="An Error Occured.")

@app.route('/quiz/submit',methods=["POST"]) # With Quiz Results
@jwt_required()
def submitQuiz():
    '''data=
        {
            quizID : ""
            answers : {
                "qId": marked Answer
                .   Must return index of correct option or correctInteger
                .
                .
            }
            endTime:""
        }
    '''
    currUser=get_jwt_identity()
    data = request.json
    quizID=data["quizID"]
    correctAnswers=[] #currUser:correctAnswers -> push in userCorrectAnswers
    for qId,ans in data["answers"].items():
        ques = mongo.db.questions.find_one({"_id":ObjectId(qId)})
        if ques["type"]=="mcq" and ques["correctIndex"]==ans:
            correctAnswers.append(qId)
        if ques["type"]=="integer" and ques["correctInteger"]==ans:
            correctAnswers.append(qId)
    quiz = mongo.db.quizzes.find_one({"quizDetails.quizId":quizID})
    attemptedQuestions=len(data["answers"])
    posMark = quiz["quizDetails"]["totalMarks"]/len(quiz["questions"])
    negMark = quiz["quizDetails"]["negativeMarkPerQuestion"]
    score = posMark*len(correctAnswers)-negMark*(attemptedQuestions-len(correctAnswers))
    mongo.db.quizResults.update_one({"quizID":quizID},{
        "$set":{
            currUser+".score":score,
            currUser+".userCorrectAnswers":correctAnswers,
            currUser+".endTime":data["endTime"]
        }
    })
    mongo.db.users.update_one({"username":currUser},{
        "$inc":{"stats.totalQuizzes":1},
        "$push":{"Quizzes":quizID}
    })
    return jsonify(message=currUser+" result added successfully.")

@app.route('/quiz-results/<quizID>',methods=["GET"])
@jwt_required()
def results(quizID):
    leaderboard=dict()
    res = mongo.db.quizResults.find_one({"quizID":quizID})
    result=dict()
    for k,v in res.items():
        if(k=="_id" or k=="quizID"): continue
        result[k]=v
    result=dict(sorted(
    result.items(),
    key=lambda x: (-x[1]["score"], x[1]["endTime"])
    ))
    return jsonify(result=result)

if __name__ == "__main__":
    app.run(port=5001,debug=True)