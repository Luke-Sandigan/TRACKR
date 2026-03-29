import os
basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'postgresql+psycopg2://postgres:hr@localhost:5432/trackr_db' 

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
    GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET')
    # for reinstalling cached packages
    # python -m pip install flask flask-sqlalchemy flask-migrate flask-cors flask-wtf psycopg[binary] requests
    # piplist1.txt = latest ver
    # pip install -r <package-name>.txt
    