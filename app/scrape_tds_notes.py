import json
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Constants
CHROMEDRIVER_PATH = "C:/chromedriver/chromedriver.exe"
TDS_CONTENT_URL = "https://tds.s-anand.net/#/2025-01"

def scroll_to_bottom(driver):
    last_height = driver.execute_script("return document.body.scrollHeight")
    while True:
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(2)
        new_height = driver.execute_script("return document.body.scrollHeight")
        if new_height == last_height:
            break
        last_height = new_height

def expand_all_details(driver):
    details_elements = driver.find_elements(By.TAG_NAME, "details")
    for elem in details_elements:
        driver.execute_script("arguments[0].setAttribute('open', true);", elem)

def extract_tds_content(driver):
    print("🌐 Scraping TDS course content page...")
    driver.get(TDS_CONTENT_URL)
    time.sleep(5)
    scroll_to_bottom(driver)

    # Wait until article loads
    try:
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "main"))
        )
    except:
        print("⚠️ Main content not found")
        return []

    expand_all_details(driver)

    try:
        content_blocks = driver.find_elements(By.CSS_SELECTOR, "article.markdown-section *")
        notes = []
        for elem in content_blocks:
            text = elem.text.strip()
            if not text:
                continue

            links = []
            anchor_tags = elem.find_elements(By.TAG_NAME, "a")
            for a in anchor_tags:
                href = a.get_attribute("href")
                if href:
                    links.append(href)

            note_entry = {
                "source": "tds-content",
                "date": "2025-01-01",
                "content": text
            }
            if links:
                note_entry["links"] = links

            notes.append(note_entry)

        print(f"📘 Found {len(notes)} content blocks")
        return notes
    except Exception as e:
        print(f"⚠️ Error scraping TDS content: {e}")
        return []

def main():
    options = Options()
    options.add_argument("--start-maximized")
    service = Service(CHROMEDRIVER_PATH)
    driver = webdriver.Chrome(service=service, options=options)

    try:
        tds_notes = extract_tds_content(driver)
        if tds_notes:
            with open("tds_notes.json", "w", encoding="utf-8") as f:
                json.dump(tds_notes, f, ensure_ascii=False, indent=2)
            print(f"💾 Saved {len(tds_notes)} items to tds_notes.json")
    finally:
        driver.quit()

if __name__ == "__main__":
    main()
