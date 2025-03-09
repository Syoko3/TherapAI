import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS

# Configure Gemini AI
API_KEY = "AIzaSyCBGpX8lJOdXto27EUsMZ_qhi2Er9dXTyI"  # Replace with your actual API key
chatHistory = ""
genai.configure(api_key=API_KEY)

# Attempt to use Gemini Flash, with robust error handling
try:
    model = genai.GenerativeModel('gemini-1.5-flash')
except Exception as e:
    print(f"Error initializing Gemini Flash: {e}")
    model = None  # Set model to None if Flash initialization fails

# Initialize Flask app
app = Flask(__name__)
CORS(app)

emotion_colors = {
    "Very Positive": "#FFD700",  # Gold
    "Positive": "#FFECB3",  # Light Yellow
    "Neutral": "#95a5a6",  # Gray
    "Negative": "#A9C2DE", # Light Blue
    "Very Negative": "#3498db",  # Blue
    "Angry": "#E57373", # Light red
    "Excited": "#FFB300", # Darker yellow
    "Calm": "#81C784", # Light Green
    "Anxious": "#FFAB91", # Light Orange
    "Surprised": "#CE93D8", # Light Purple
    "Disgusted": "#A1887F", # Light Brown
    "Fearful": "#B0BEC5" # Light Gray Blue
}

emotion_list = list(emotion_colors.keys())

def analyze_emotion(text):
    """Ask Gemini to determine the best-fitting emotion."""
    if model is None:
        return "Neutral", emotion_colors["Neutral"]

    prompt = f"Given the following text: '{text}', which of these emotions best fits: {', '.join(emotion_list)}? If none fit, respond with 'Neutral'."

    try:
        response = model.generate_content(prompt)
        emotion = response.text.strip()

        if emotion in emotion_colors:
            return emotion, emotion_colors[emotion]
        else:
            return "Neutral", emotion_colors["Neutral"]
    except Exception as e:
        print(f"Error analyzing emotion: {e}")
        return "Neutral", emotion_colors["Neutral"]

def generate_therapist_response(user_input):
    """Generate a therapist-like response using the Gemini AI model."""
    if model is None:
        return "Gemini Flash is unavailable. Please check your API key and region."

    try:
        response = model.generate_content("Act as a compassionate and supportive therapist using a Cognitive Behavioral Therapy (CBT) approach. Focus on helping me identify and challenge negative thought patterns. Encourage me to explore my feelings and develop coping mechanisms for depression. Do not give medical advice, but offer helpful exercises and strategies for managing my mental health. Be encouraging and gentle. Do not use any placeholder language or say anything that would indicate you are an ai. Your patient is asking you the following: "+user_input + ". The following is a chat history detailing the conversation you have been having with this patient. If it is empty then this is the beggining of the conversation: " + chatHistory + ". Keep the length of your responses rather short but still convey what you need to. Don't include the user input in the response, ie. dont have 'TherapAI:' or 'User:' in the response.")
        return response.text.strip()
    except Exception as e:
        print(f"Error generating therapist response: {e}")
        return "I'm here to listen. Would you like to talk more about your feelings?"

@app.route("/chat", methods=["POST"])
def chat():
    global chatHistory # Declare chatHistory as global to modify it
    try:
        data = request.get_json()
        user_input = data.get("message", "")

        if not user_input:
            return jsonify({"error": "Message is required"}), 400

        therapist_response = generate_therapist_response(user_input)
        mental_state, color = analyze_emotion(user_input)

        # Update chat history
        chatHistory += f"User: {user_input}\nTherapAI: {therapist_response}\n"

        return jsonify({
            "response": therapist_response,
            "mental_state": mental_state,
            "color": color
        })

    except Exception as e:
        print(f"Server error: {e}")
        return jsonify({"error": "An internal server error occurred."}), 500

if __name__ == "__main__":
    app.run(debug=True)