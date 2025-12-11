import os
import json
import re
import google.generativeai as genai

from flask import Flask,request,jsonify

from dotenv import load_dotenv

from flask_pymongo import PyMongo

from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required, JWTManager

from flask_cors import CORS

from werkzeug.security import generate_password_hash, check_password_hash

from bson import ObjectId

from datetime import timedelta,datetime,timezone

import pytz

load_dotenv()

app = Flask(__name__)
#app.config["DEBUG"]=True
# Setup the Flask-JWT-Extended extension
app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY")  # Change this!
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=7) #Login Required in every 7 days
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

jwt = JWTManager(app)

app.config["MONGO_URI"] = os.environ.get("MONGO_URI")
mongo = PyMongo(app)

CORS(app)

def removeQuestions(questions):
    qDB = mongo.db.questions
    for q in questions:
        ques = qDB.find_one({"_id":ObjectId(q)})
        if not ques:
            continue
        ques["askedIn"]-=1
        qDB.delete_one({"_id":ObjectId(q)})
        if ques["askedIn"]>0:
            qDB.insert_one(ques)

def get_gemini_mcq(topic):
    """
    Generates an MCQ using Gemini with strict JSON enforcement.
    """
    # 1. Use generation_config to force JSON MIME type (Available in Gemini 1.5 models)
    generation_config = {
        "temperature": 1,
        "top_p": 0.95,
        "top_k": 64,
        "max_output_tokens": 8192,
        "response_mime_type": "application/json",
    }

    model = genai.GenerativeModel(
        model_name="gemini-2.5-flash",
        generation_config=generation_config,
        system_instruction=(
            "You are a quiz generation API. "
            "Output ONLY raw JSON. No Markdown. No commentary."
        )
    )

    # 2. The Prompt
    prompt = f"""
    Generate a multiple-choice question about: {topic}.

    Follow this exact JSON schema:
    {{
      "type": "mcq",
      "text": "Question text here",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctIndex": 0
    }}
    
    Constraints:
    - The "options" array must contain exactly 4 strings.
    - "correctIndex" must be an integer (0-3).
    """

    try:
        response = model.generate_content(prompt)
        response_text = response.text

        # 3. Extra Safety: Sanitize Markdown just in case
        # (Removes ```json and ``` if the model ignores the mime_type instruction)
        clean_text = re.sub(r"```json|```", "", response_text).strip()
        
        # 4. Parse into a Python dictionary
        data = json.loads(clean_text)
        return data

    except Exception as e:
        print(f"Error generating quiz: {e}")
        return None
    
@app.route("/signup", methods=["POST"])
def register():
    statAdmin={"totalQuizzes": 0,"Total Participants": 0,"Public Quizzes":0,"MM Quiz made":0}
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
        if("_id" in ques):
            mongo.db.questions.update_one({"_id":ObjectId(ques["_id"])},{
                "$inc":{"askedIn":1},
                "$set":{
                    "type": ques.get("type"),
                    "text": ques.get("text"),
                    "options": ques.get("options") if ques.get("type") == "mcq" else [],
                    "subject":ques.get("subject"),
                    "tag":ques.get("tag") 
                }
            })
            questions.append(ques["_id"])
            continue

        doc = {
            "askedIn": 1,
            "type": ques.get("type"),
            "text": ques.get("text"),
            "options": ques.get("options") if ques.get("type") == "mcq" else [],
            "subject":ques.get("subject"),
            "tag":ques.get("tag")
        }
        if ques.get("type") == "mcq":
            doc["correctIndex"] = ques.get("correctIndex")
        else:
            doc["correctInteger"] = ques.get("correctInteger")
        res = mongo.db.miscellaneous.find_one({"type":"tags"})
        if (ques["subject"].upper() not in res) or (ques["tag"].lower() not in res[ques["subject"].upper()]):
            mongo.db.miscellaneous.update_one({"type":"tags"},{
                "$push":{ques["subject"].upper():ques["tag"].lower()},
            })  

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
        result={
            "quizID":data["quizDetails"]["quizId"]
        }
        mongo.db.quizResults.insert_one(result)
        isPublic=(data["quizDetails"]["visibility"]=="public")
        inc_fields={}
        for admin in data["quizDetails"]["adminIds"]:
            mongo.db.users.update_one({"username":admin},
            {
                "$inc":{"stats.totalQuizzes":1,
                        "stats.Public Quizzes":int(isPublic)},
                "$push":{"Quizzes":data["quizDetails"]["quizId"]},
                "$max":{"stats.MM Quiz made":data["quizDetails"]["totalMarks"]}
            })
            inc_fields[f"{admin}.{data['quizDetails']['startTime'][:7]}"]=1

        mongo.db.miscellaneous.update_one({"type":"performance"},{
            "$inc":inc_fields
        })
        return jsonify(message="Quiz Created Successfully.")
    except Exception as e:
        print(e)
        return jsonify(message="An Error Occured.")

@app.route('/quiz/<quizID>',methods=["GET"])
@jwt_required()
def quiz(quizID):
    currUser=get_jwt_identity()
    qz = mongo.db.quizzes.find_one({"quizDetails.quizId":quizID})
    if not qz:
        return jsonify(message="Quiz Doesn't Exist")
    qzR = mongo.db.quizResults.find_one({"quizID":quizID})
    message="Quiz hasn't started."
    ist = pytz.timezone("Asia/Kolkata")

    start_time = datetime.fromisoformat(qz["quizDetails"]["startTime"])
    if start_time.tzinfo is None:
        start_time = ist.localize(start_time)

    now = datetime.now(ist)

    end_time = start_time + timedelta(minutes=qz["quizDetails"]["durationMinutes"])
    if start_time<=now and end_time>=now:
        message="Quiz Found."
    if currUser in qzR:
        message="Already Given"
    ques = []
    for q in qz["questions"]:
        qu=mongo.db.questions.find_one({"_id":ObjectId(q)})
        qu["_id"]=str(qu["_id"])
        ques.append(qu)
    return jsonify(message=message,quizDetails=qz["quizDetails"],questions=ques)

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
    val=mongo.db.miscellaneous.find_one({"type":"performance"})
    avg=score*10/quiz["quizDetails"]["totalMarks"]
    if(currUser in val):
        for v in val[currUser].values():
            avg+=v
        avg=avg/(len(val[currUser])+1)
    mongo.db.users.update_one({"username":currUser},{
        "$inc":{"stats.totalQuizzes":1,
                "stats.attempts":1},
        "$set":{"stats.avgScore":avg},
        "$max":{"stats.bestScore":score},
        "$push":{"Quizzes":quizID}
    })
    score=score*10/quiz["quizDetails"]["totalMarks"]

    if currUser in val: 
        if quiz["quizDetails"]["startTime"][:7] not in val[currUser]:
            val[currUser][quiz["quizDetails"]["startTime"][:7]]=score
        else: score=(val[currUser][quiz["quizDetails"]["startTime"][:7]]+score)/2
    else: val=0
    mongo.db.miscellaneous.update_one({"type":"performance"},{
        "$set":{currUser+"."+quiz["quizDetails"]["startTime"][:7]:score}
    })
    for admin in quiz["quizDetails"]["adminIds"]:
        mongo.db.users.update_one({"username":admin},{
            "$inc":{"stats.Total Participants":1}
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
    return jsonify(result)

@app.route('/get-public-quizzes',methods=["GET"])
@jwt_required()
def getPublicQuizzes():
    currUser=get_jwt_identity()
    userType = mongo.db.users.find_one({"username":currUser})["userType"]
    quizzes=[]
    res = mongo.db.quizzes.find({"quizDetails.visibility":"public"}) if userType=="student" else mongo.db.quizzes.find({"quizDetails.adminIds":currUser})
    for qz in res:
        ist = pytz.timezone("Asia/Kolkata")

        start_time = datetime.fromisoformat(qz["quizDetails"]["startTime"])
        if start_time.tzinfo is None:
            start_time = ist.localize(start_time)

        now = datetime.now(ist)

        endTime = start_time + timedelta(minutes=qz["quizDetails"]["durationMinutes"])
        if now<=endTime:
            quizzes.append({
                "title": qz["quizDetails"]["quizName"],
                "startTime": qz["quizDetails"]["startTime"],
                "duration": qz["quizDetails"]["durationMinutes"], 
                "id": qz["quizDetails"]["quizId"],
                "adminIds":qz["quizDetails"]["adminIds"]
            })
    return quizzes

@app.route('/past-quizzes',methods=["GET"])
@jwt_required()
def pastQuizzes():
    currUser=get_jwt_identity()
    quizzes=[]
    res = mongo.db.users.find_one({"username":currUser})
    for qID in res["Quizzes"]:
        qz = mongo.db.quizzes.find_one({"quizDetails.quizId":qID})
        if not qz: continue
    ist = pytz.timezone("Asia/Kolkata")

    start_time = datetime.fromisoformat(qz["quizDetails"]["startTime"])
    if start_time.tzinfo is None:
        start_time = ist.localize(start_time)

    now = datetime.now(ist)

    endTime = start_time + timedelta(minutes=qz["quizDetails"]["durationMinutes"])
    #print(qz)
    if now>endTime:
        quizzes.append({
            "title": qz["quizDetails"]["quizName"],
            "startTime": qz["quizDetails"]["startTime"],
            "duration": qz["quizDetails"]["durationMinutes"],
            "resultTime":qz["quizDetails"]["resultTime"], 
            "id": qz["quizDetails"]["quizId"]
        })
    return quizzes

@app.route('/get-all-questions',methods=["GET"])
@jwt_required()
def getQuestion():
    ques = list(mongo.db.questions.find({}))
    for q in ques:
        q["_id"]=str(q["_id"])
    return ques

@app.route('/get-tags/<subject>',methods=["GET"])
@jwt_required()
def getTags(subject):
    if subject=="": return []
    res = mongo.db.miscellaneous.find_one({"type":"tags"})
    return res[subject] if (subject in res) else []

@app.route('/delete-quiz/<quizId>',methods=["GET"])
@jwt_required()
def deleteQuiz(quizId):
    currUser=get_jwt_identity()
    quiz = mongo.db.quizzes.find_one({"quizDetails.quizId":quizId})
    if not quiz:
        return jsonify(message="Quiz not Found.")
    removeQuestions(quiz["questions"])
    isPublic=(quiz["quizDetails"]["visibility"]=="public")
    dec_fields={}
    for admin in quiz["quizDetails"]["adminIds"]:
        mongo.db.users.update_one({"username":admin},{
            "$pull":{"Quizzes":quizId},
            "$inc":{"stats.totalQuizzes":-1,
                    "stats.Public Quizzes":-int(isPublic)}
        })
        dec_fields[f"{admin}.{quiz["quizDetails"]["startTime"][:7]}"]=-1
    mongo.db.miscellaneous.update_one({"type":"performance"},{
        "$inc":dec_fields
    })
    mongo.db.quizzes.delete_one({"quizDetails.quizId":quizId})
    mongo.db.quizResults.delete_one({"quizID":quizId})
    return jsonify(message="Quiz Deleted Successfully.")

@app.route('/get-performance',methods=["GET"])
@jwt_required()
def getPerformance():
    currUser=get_jwt_identity()
    y=[]
    x=[]
    res = mongo.db.miscellaneous.find_one({"type":"performance"})
    if currUser not in res:
        return jsonify(x=[0],y=[0])
    for k,v in res[currUser].items():
        x.append(k)
        y.append(v)

    return jsonify(x=x,y=y)

@app.route('/edit-quiz',methods=["POST"])
@jwt_required()
def editQuiz():
    currUser=get_jwt_identity()
    data=request.json
    qId=data["quizDetails"]["quizId"]
    if currUser not in data["quizDetails"]["adminIds"]:
        return jsonify(message="Only Registered Admins can Edit Quiz.")
    
    mongo.db.quizzes.update_one({"quizDetails.quizId":qId},{
        "$set":{"quizDetails":data["quizDetails"],
                "questions":data["questions"]}
    })
    return jsonify(message="Quiz Edited Successfully.")

@app.route("/delete-questions", methods=["POST"])
@jwt_required()
def deleteQuestion():
    data = request.get_json() or []
    removeQuestions(data)
    return jsonify(message="Questions Deleted Successfully")
    
@app.route('/generate-ai-question',methods=["POST"])
@jwt_required()
def getAIQuestion():
    data = request.get_json()
    topic = data.get('subject')+"-"+data.get("tag")

    quiz_data = get_gemini_mcq(topic)

    if quiz_data:
        # Returns the exact format your frontend needs
        return jsonify(quiz_data), 200
    else:
        return jsonify({"error": "Failed to generate question"}), 500
    

if __name__ == "__main__":
    app.run(port=5001,debug=True)