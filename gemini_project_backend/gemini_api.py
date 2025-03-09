# this is purely for testing basic communication with gemini through the terminal
# app.py will use flask to take form data from the react frontend and send it to gemini

import google.generativeai as genai

# Set up API key
API_KEY = "AIzaSyCBGpX8lJOdXto27EUsMZ_qhi2Er9dXTyI"
genai.configure(api_key=API_KEY)

# List available models (for debugging)
available_models = genai.list_models()
print("Available models:", [model.name for model in available_models])

# Ensure the correct model is used
model = genai.GenerativeModel(model_name="gemini-1.5-flash")

def chat_with_gemini(prompt):
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error: {e}"

if __name__ == "__main__":
    while True:
        user_input = input("You: ")
        if user_input.lower() in ["exit", "quit"]:
            print("Goodbye!")
            break
        
        response = chat_with_gemini(user_input)
        print(f"Gemini: {response}\n")
