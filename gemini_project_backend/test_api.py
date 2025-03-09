import requests
import json

# Replace with your Flask app's URL
url = 'http://127.0.0.1:5000/chat'  # Flask server running locally

# Example form data you want to test with
data = {
    "message": "I'm feeling really stressed today."  # Example message
}

# Send the POST request to your Flask API
response = requests.post(url, json=data)

# Print the response
if response.status_code == 200:
    print(response.json())  # Output the JSON response from Flask
else:
    print(f"Error: {response.status_code}")
