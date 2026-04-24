import requests
from bs4 import BeautifulSoup

url = "https://shopee.ph/TTArtisan-Auto-Focus-35mm-F1.8-Mark-II-prime-lens-camera-lens-for-X-E-Z-mount-i.515029852.24453355842"

headers = {
    "User-Agent": "Mozilla/5.0"
}

res = requests.get(url, headers=headers)
soup = BeautifulSoup(res.text, "html.parser")

print(soup.title.text)