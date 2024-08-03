from flask import Flask, request, jsonify
from langchain.prompts import ChatPromptTemplate
from langchain.chat_models import ChatOpenAI
from dotenv import load_dotenv, find_dotenv
import os
from flask_cors import CORS
from werkzeug.utils import secure_filename
import speech_recognition as sr
from pydub import AudioSegment
import tempfile


load_dotenv(find_dotenv())

app = Flask(__name__)
CORS(app)

chat = ChatOpenAI(
    model_name="gpt-3.5-turbo",
    temperature=0.7,
    openai_api_key='sk-proj-oI0a8HjpkS8kHWtMkk6AT3BlbkFJR5FWojyHdkgqptZ7yub3'
)

response_template = """
You are an AI assistant specializing in weather analysis. Here's the detailed weather information:
- Current Weather: {description}
- Temperature: {temp}°C
- Humidity: {humidity}%
- Wind Speed: {wind_speed} m/s

Hourly forecast for today:
{hourly_forecast}

Forecast for tomorrow:
{tomorrow_forecast}

Given this information, respond to the user's question: "{user_query}"
Provide a concise, informative, and friendly answer, focusing on clarity and relevance to the user's specific weather-related query. Keep it concise and short, up to 30 words at most.
"""

response_prompt_template = ChatPromptTemplate.from_template(response_template)


@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400

    audio_file = request.files['audio']
    
    # Save the uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix='.m4a') as temp_audio:
        audio_file.save(temp_audio.name)
        temp_audio_path = temp_audio.name

    # Convert m4a to wav (speech_recognition requires wav)
    wav_path = temp_audio_path.replace('.m4a', '.wav')
    audio = AudioSegment.from_file(temp_audio_path, format="m4a")
    audio.export(wav_path, format="wav")

    # Perform speech recognition
    recognizer = sr.Recognizer()
    with sr.AudioFile(wav_path) as source:
        audio_data = recognizer.record(source)
        try:
            text = recognizer.recognize_google(audio_data)
        except sr.UnknownValueError:
            text = "Could not understand audio"
        except sr.RequestError as e:
            text = f"Could not request results; {e}"

    # Clean up temporary files
    os.remove(temp_audio_path)
    os.remove(wav_path)

    return jsonify({'transcription': text})


@app.route('/generate_message', methods=['POST'])
def generate_message():
    try:
        data = request.json
        description = data.get('description', 'unknown weather')
        temp = data.get('temp', 'N/A')
        humidity = data.get('humidity', 'N/A')
        wind_speed = data.get('windSpeed', 'N/A')
        hourly_forecast = data.get('hourlyForecast', [])
        tomorrow_forecast = data.get('tomorrowForecast', [])
        user_query = data.get('userQuery', '')

        formatted_tomorrow_forecast = "\n".join([f"Time: {forecast['dt_txt']}, Weather: {forecast['weather'][0]['description']}, Temp: {forecast['main']['temp']}°C" for forecast in tomorrow_forecast])

        prompt = response_prompt_template.format_messages(
            description=description,
            temp=temp,
            humidity=humidity,
            wind_speed=wind_speed,
            hourly_forecast=hourly_forecast,
            tomorrow_forecast=formatted_tomorrow_forecast,
            user_query=user_query
        )
        response = chat(prompt)
        message = response.content.strip()
        return jsonify({"message": message})
    except Exception as e:
        print(f"Error generating message: {str(e)}")
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')