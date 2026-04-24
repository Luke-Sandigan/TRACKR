import requests
import os

APIFY_TOKEN = os.getenv("APIFY_TOKEN")

ACTOR_ID = "gio/shopee-scraper"

def scrape_shopee(query, country="ph", max_items=20):
    url = f"https://api.apify.com/v2/acts/{ACTOR_ID}/runs?token={APIFY_TOKEN}"

    payload = {
        "search": query,
        "country": country,
        "maxItems": max_items
    }

    response = requests.post(url, json=payload)
    data = response.json()

    return data