
# Mr. Weather

Mr. Weather is a fun and interactive weather app that provides real-time weather conditions and forecasts. Designed to give users a personalized experience, Mr. Weather offers voice input capabilities to let you ask questions about the weather, receive hourly and next-day forecasts, and get notified about rain alerts.

## Features

- **Real-Time Weather:** Get current weather conditions, including temperature, humidity, wind speed, and a brief description.
- **Hourly & Daily Forecasts:** Access hourly forecasts for the next 24 hours and a forecast for the following day.
- **Voice Interaction:** Use voice commands to inquire about the weather.
- **Rain Alerts:** Get notifications if rain is expected, so you never leave home unprepared.

## Technology Stack

- **Frontend:** Built using React Native to provide a seamless cross-platform mobile experience with support for dark mode.
- **Backend:** Powered by a Flask API that processes weather data and handles user queries.
- **APIs Used:**
  - [OpenWeather API](https://openweathermap.org/api) for obtaining weather data.
  - [OpenCage API](https://opencagedata.com/api) for geolocation services.
- **Voice Recognition:** Utilizes Google’s speech recognition API to convert voice input to text for a hands-free experience.
- **AI Integration:** Uses OpenAI’s GPT-3.5 Turbo model to generate concise and informative weather-related responses to user queries.

## Getting Started

### Prerequisites

- **Node.js** and **npm**: Ensure you have Node.js and npm installed on your system to run the React Native app.
- **Python** and **pip**: Required for setting up the Flask backend.
- **Expo CLI**: Install Expo CLI globally to run the React Native app.
- **API Keys**: Obtain API keys from OpenWeather, OpenCage, and OpenAI.

### Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/yourusername/mr-weather.git
   cd mr-weather
   ```
2. **Install Frontend Dependencies:**

   ```bash
   cd frontend
   npm install
   ```
3. **Set Up Backend:**

   - Navigate to the backend directory.
   - Create and activate a virtual environment:
     ```bash
     python -m venv venv
     source venv/bin/activate # On Windows use `venv\Scripts\activate`
     ```
   - Install the required Python packages:
     ```bash
     pip install -r requirements.txt
     ```
   - Create a `.env` file in the backend directory and add your API keys:
     ```
     WEATHER_API_KEY=your_openweather_api_key
     GEOCODE_API_KEY=your_opencage_api_key
     OPENAI_API_KEY=your_openai_api_key
     ```
4. **Run the Application:**

   - Start the Flask server:
     ```bash
     python app.py
     ```
   - Run the React Native app using Expo:
     ```bash
     npm start
     ```

## Usage

1. Launch the app on your mobile device using Expo.
2. Allow location access to get the current weather for your area.
3. Use the search bar to look up weather in different cities.
4. Tap the microphone icon to use voice commands for weather inquiries.
5. Check the hourly forecast and prepare for any upcoming rain with alerts.

## Future Plans

- **Tailored Weather for Farmers:** Provide specialized weather insights for farmers based on soil and crop types.
- **Enhanced Voice Recognition:** Improve the accuracy and capabilities of voice interactions.
