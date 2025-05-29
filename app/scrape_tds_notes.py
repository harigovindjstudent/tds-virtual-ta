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
TDS_BASE_URL = "https://tds.s-anand.net/#/README"


def scroll_to_bottom(driver):
    last_height = driver.execute_script("return document.body.scrollHeight")
    while True:
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(2)
        new_height = driver.execute_script("return document.body.scrollHeight")
        if new_height == last_height:
            break
        last_height = new_height


def expand_all_sidebar_sections(driver):
    # Expand all <details> elements in the sidebar
    details_tags = driver.find_elements(By.CSS_SELECTOR, ".sidebar details")
    for tag in details_tags:
        driver.execute_script("arguments[0].setAttribute('open', true);", tag)
        time.sleep(0.2)


def collect_all_internal_links(driver):
    # Extract all anchor tags from the full sidebar after expanding
    link_elems = driver.find_elements(By.CSS_SELECTOR, ".sidebar a")
    hrefs = set()
    for elem in link_elems:
        href = elem.get_attribute("href")
        if href and href.startswith("https://tds.s-anand.net/#/"):
            hrefs.add(href)
    return sorted(list(hrefs))


def extract_content_from_page(driver, url):
    driver.get(url)
    time.sleep(3)
    scroll_to_bottom(driver)

    try:
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "main"))
        )
    except:
        print(f"⚠️ Main content not found for: {url}")
        return []

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
            "source": "tds_notes",
            "topic_title": url.split("#/")[-1],
            "content": text,
            "url": url
        }
        if links:
            note_entry["links"] = links

        notes.append(note_entry)

    return notes


def main():
    options = Options()
    options.add_argument("--start-maximized")
    service = Service(CHROMEDRIVER_PATH)
    driver = webdriver.Chrome(service=service, options=options)

    all_notes = []
    try:
        print("🌐 Loading README page and sidebar...")
        driver.get(TDS_BASE_URL)
        time.sleep(3)
        expand_all_sidebar_sections(driver)

        print("🔍 Collecting internal links...")
        all_links = collect_all_internal_links(driver)

        print(f"📄 Found {len(all_links)} pages to scrape.")
        for link in all_links:
            print(f"➡️ Scraping: {link}")
            all_notes.extend(extract_content_from_page(driver, link))

        with open("data/tds_notes.json", "w", encoding="utf-8") as f:
            json.dump(all_notes, f, ensure_ascii=False, indent=2)
        print(f"💾 Saved {len(all_notes)} items to data/tds_notes.json")
    finally:
        driver.quit()


if __name__ == "__main__":
    main()
