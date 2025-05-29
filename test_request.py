import requests
import base64

API_URL = "http://127.0.0.1:8000/api/"

# Optional image input
image_path = None  # e.g., "project-tds-virtual-ta-q1.webp"
encoded_image = None

if image_path:
    with open(image_path, "rb") as img_file:
        encoded_image = base64.b64encode(img_file.read()).decode("utf-8")

payload = {
    "question": "How many GAs are there in the TDS course?",
}
if encoded_image:
    payload["image"] = encoded_image

response = requests.post(API_URL, json=payload)

try:
    print(response.json())
except Exception as e:
    print("Error in response:", response.text)
