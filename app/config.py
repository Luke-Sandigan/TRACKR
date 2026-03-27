import os
basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'postgresql+psycopg2://postgres:hr@localhost:5432/trackr_db' 

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # for reinstalling cached packages
    # python -m pip install flask flask-sqlalchemy flask-migrate flask-cors flask-wtf psycopg[binary] requests
    # piplist1.txt = latest ver
    # pip install -r <package-name>.txt
    