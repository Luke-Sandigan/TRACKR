# TRACKR

Hello, we are the **Deep Penetration Unit**, the team responsible for creating this **TRACKR** web application.

This application (currently in production) tracks prices across online web platforms such as **Facebook Marketplace** and **Shopee**.

---

## Requirements

Make sure you have the following installed before proceeding:

- [Python 3.10+](https://www.python.org/downloads/)
- [PostgreSQL](https://www.postgresql.org/download/)
- [Git](https://git-scm.com/)

---

## How to Run the Application

### Step 1 — Clone the Repository

```bash
git clone https://github.com/Luke-Sandigan/TRACKR.git 
cd TRACKR
```

---

### Step 2 — Create a Virtual Environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```



---

### Step 3 — Install Dependencies

```bash
pip install -r requirements.txt
```

---

### Step 4 — Set Up Environment Variables

Create a `.env` file in the root `TRACKR/` folder:

```
TRACKR/
└── .env        ← create this file here
└── run.py
```

Open the `.env` file and fill in your own credentials:

```env
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

> To get your Google credentials:
> 1. Go to [console.cloud.google.com](https://console.cloud.google.com)
> 2. Create a project → **APIs & Services** → **Credentials**
> 3. Create **OAuth 2.0 Client ID** → Web Application
> 4. Set **Authorized redirect URI** to `http://localhost:5000/auth/google/callback`
> 5. Copy your **Client ID** and **Client Secret** into the `.env` file


---

### Step 5 — Set Up the Database

Make sure **PostgreSQL is running** on your machine, then run:

**Windows:**
```bash
set FLASK_APP=run.py
python -m flask db upgrade
```

---

### Step 6 — Run the Application


**Windows:**
```bash
python run.py
```

Open your browser and go to:
```
http://localhost:5000
```

---

## Every Time You Return to the Project

You only need to activate the virtual environment and run the app:

**Windows:**
```bash
venv\Scripts\activate
python run.py
```

---

## Project Structure

```
└── 📁TRACKR
    └── 📁app
        └── 📁static
            └── 📁css
            └── 📁images
        └── 📁templates
        ├── __init__.py
        ├── config.py
        ├── forms.py
        ├── models.py
        ├── routes.py
        ├── services.py
    └── 📁migrations
    ├── .env              ← you create this (not committed to Git)
    ├── .env.example      ← reference for what goes in .env
    ├── .gitignore
    ├── requirements.txt
    └── run.py
```

---

## Common Errors

| Error | Fix |
|---|---|
| `ModuleNotFoundError: No module named 'flask'` | Run `pip install -r requirements.txt` with venv activated |
| `could not connect to server` | PostgreSQL is not running, start it first |
| `Error 400: redirect_uri_mismatch` | Add `http://localhost:5000/auth/google/callback` to your Google Cloud Console authorized redirect URIs |
| `NameError: name 'X' is not defined` | Check that all imports are correct in `__init__.py` |
| `venv\Scripts\activate` permissions error (Windows) | Run `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` |