import os
import time
import json
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from dotenv import load_dotenv
import requests

# Load credentials
load_dotenv()
EMAIL = os.getenv("DISCOURSE_EMAIL")
PASSWORD = os.getenv("DISCOURSE_PASSWORD")

# Constants
CHROMEDRIVER_PATH = "C:/chromedriver/chromedriver.exe"
BASE_URL = "https://discourse.onlinedegree.iitm.ac.in"
CATEGORY_URL = f"{BASE_URL}/c/courses/tds-kb/34"
TDS_CONTENT_URL = "https://tds.s-anand.net/#/2025-01"
START_DATE = datetime.strptime("1 Jan 2025", "%d %b %Y")
END_DATE = datetime.strptime("14 Apr 2025", "%d %b %Y")


def login(driver):
    print("🚀 Logging in...")
    driver.get("https://discourse.onlinedegree.iitm.ac.in/login")
    time.sleep(2)
    driver.find_element(By.ID, "login-account-name").send_keys(EMAIL)
    driver.find_element(By.ID, "login-account-password").send_keys(PASSWORD)
    driver.find_element(By.XPATH, "//button[contains(@class,'btn-primary')]").click()
    time.sleep(5)
    print("✅ Logged in!")


def scroll_to_bottom(driver):
    last_height = driver.execute_script("return document.body.scrollHeight")
    while True:
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(2)
        new_height = driver.execute_script("return document.body.scrollHeight")
        if new_height == last_height:
            break
        last_height = new_height


def extract_discourse_posts(driver):
    driver.get(CATEGORY_URL)
    scroll_to_bottom(driver)
    print("🔍 Scrolling done, collecting topic links...")

    posts = []
    topic_rows = driver.find_elements(By.CSS_SELECTOR, "tr[class*='topic-list-item']")
    print(f"🧠 Found {len(topic_rows)} topics")

    for row in topic_rows:
        try:
            title_elem = row.find_element(By.CSS_SELECTOR, "td.main-link a")
            title = title_elem.text.strip()
            url = title_elem.get_attribute("href")

            activity_cell = row.find_element(By.CSS_SELECTOR, "td.activity")
            created_text = activity_cell.get_attribute("title")

            if created_text and "Created:" in created_text:
                created_date_str = created_text.split("Created:")[1].split("\n")[0].strip()
                post_created = datetime.strptime(created_date_str, "%b %d, %Y %I:%M %p")

                if START_DATE <= post_created <= END_DATE:
                    posts.append({"title": title, "url": url})
        except Exception as e:
            print(f"⚠️ Skipping row due to error: {e}")

    session = requests.Session()
    for cookie in driver.get_cookies():
        session.cookies.set(cookie['name'], cookie['value'])

    all_posts = []

    for post in posts:
        print(f"📚 Scraping: {post['title']}")
        page = 1
        while True:
            json_url = f"{post['url']}.json?page={page}"
            try:
                response = session.get(json_url)
                if response.status_code != 200:
                    break

                data = response.json()
                posts_stream = data.get("post_stream", {}).get("posts", [])
                if not posts_stream:
                    break  # No more posts

                for entry in posts_stream:
                    created_at = datetime.strptime(entry["created_at"], "%Y-%m-%dT%H:%M:%S.%fZ")
                    if START_DATE <= created_at <= END_DATE:
                        content = entry.get("cooked", "").strip()
                        parent = entry.get("reply_to_post_number")
                        all_posts.append({
                            "source": "discourse",
                            "topic_title": post["title"],
                            "url": post["url"],
                            "date": created_at.isoformat(),
                            "content": content,
                            "post_number": entry.get("post_number"),
                            "reply_to_post_number": parent  # Track parent post number
                        })
                page += 1
            except Exception as e:
                print(f"⚠️ Failed to fetch {json_url}: {e}")
                break

    return all_posts


def extract_tds_content(driver):
    print("🌐 Scraping TDS course content page...")
    driver.get(TDS_CONTENT_URL)
    time.sleep(5)
    scroll_to_bottom(driver)

    try:
        content_blocks = driver.find_elements(By.CLASS_NAME, "markdown")
        notes = [block.text.strip() for block in content_blocks if block.text.strip()]
        print(f"📘 Found {len(notes)} content blocks")
        return [{
            "source": "tds-content",
            "date": "2025-01-01",
            "content": note
        } for note in notes]
    except Exception as e:
        print(f"⚠️ Error scraping TDS content: {e}")
        return []


def main():
    options = Options()
    options.add_argument("--start-maximized")
    service = Service(CHROMEDRIVER_PATH)
    driver = webdriver.Chrome(service=service, options=options)

    all_data = []

    try:
        login(driver)
        discourse_posts = extract_discourse_posts(driver)
        tds_notes = extract_tds_content(driver)
        all_data = discourse_posts + tds_notes
    except KeyboardInterrupt:
        print("❌ Scraper interrupted by user.")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
    finally:
        if all_data:
            with open("new_posts.json", "w", encoding="utf-8") as f:
                json.dump(all_data, f, ensure_ascii=False, indent=2)
            print(f"💾 Saved {len(all_data)} items to new_posts.json")
        driver.quit()


if __name__ == "__main__":
    main()
