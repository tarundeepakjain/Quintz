import os
from dotenv import load_dotenv
load_dotenv()
print(os.environ.get("JWT_SECRET_KEY"))