import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TextInput,
  Alert,
  ScrollView,
  StatusBar,
  Image, // Import Image component
} from "react-native";
import * as Location from "expo-location";
import axios from "axios";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import LoadingScreen from "./LoadingScreen";
import { AutocompleteDropdown } from "react-native-autocomplete-dropdown";
import { AutocompleteDropdownContextProvider } from "react-native-autocomplete-dropdown";
import GradientBlob from "./GradientBlob";
import { BlurView } from "expo-blur";
import { ActivityIndicator } from "react-native";
import { LogBox } from "react-native";
import { Audio } from "expo-av";

import WaterPercentIcon from "./assets/icons/humidity.png";
import WindyIcon from "./assets/icons/wind.png";
import ThermometerIcon from "./assets/icons/temperature.png";
import SendIcon from "./assets/icons/send.png";
import MicIcon from "./assets/icons/mic.png";

LogBox.ignoreLogs(["Warning: ..."]); // Ignore log notification by message
LogBox.ignoreAllLogs(); //Ignore all log notifications

const WEATHER_API_KEY = "0e14fce04fe286f95b6484ccb891cde1"; // Replace with your actual OpenWeather API Key
const GEOCODE_API_KEY = "76b85548348341ed9a8dc4aeeee31b41"; // Replace with your actual OpenCage API Key

const WeatherScreen = () => {
  const [location, setLocation] = useState(null);
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [city, setCity] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [weatherMessage, setWeatherMessage] = useState("Hello Adi!");
  const [selectedCity, setSelectedCity] = useState(null);
  const [currentDate, setCurrentDate] = useState("");
  const [currentDay, setCurrentDay] = useState("");
  const [drawerVisible, setDrawerVisible] = useState(false);
  const drawerHeight = useRef(new Animated.Value(0)).current;
  const [userInput, setUserInput] = useState("");
  const [isMessageLoading, setIsMessageLoading] = useState(true);
  const [rainAlert, setRainAlert] = useState({ visible: false, message: "" });
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const textInputRef = useRef(null);
  const [currentTime, setCurrentTime] = useState("");
  const [isQuestion, setIsQuestion] = useState('');

  useEffect(() => {
    const updateCurrentTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const formattedTime = `${hours % 12 === 0 ? 12 : hours % 12}:${
        minutes < 10 ? `0${minutes}` : minutes
      } ${hours >= 12 ? "PM" : "AM"}`;
      setCurrentTime(formattedTime);
    };

    updateCurrentTime();
    const timerId = setInterval(updateCurrentTime, 60000);

    return () => clearInterval(timerId);
  }, []);

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      await newRecording.startAsync();
      setRecording(newRecording);
      setIsRecording(true);
    } catch (error) {
      console.error("Failed to start recording", error);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();

    const formData = new FormData();
    formData.append("audio", {
      uri: uri,
      type: "audio/m4a",
      name: "speech.m4a",
    });

    try {
      const response = await axios.post(
        "http://192.168.50.240:5000/transcribe",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const words = response.data.transcription.split(" ");
      for (const word of words) {
        setUserInput((prevInput) => prevInput + " " + word);
        await new Promise((resolve) => setTimeout(resolve, 300)); // 300ms delay between words
      }
    } catch (error) {
      console.error("Error sending audio to backend", error);
      Alert.alert("Error", "Failed to transcribe audio. Please try again.");
    }
  };

  const CITIES = [
    { id: "1", title: "New York, USA", coords: { lat: 40.7128, lon: -74.006 } },
    { id: "2", title: "London, UK", coords: { lat: 51.5074, lon: -0.1278 } },
    { id: "3", title: "Paris, France", coords: { lat: 48.8566, lon: 2.3522 } },
    { id: "4", title: "Tokyo, Japan", coords: { lat: 35.6895, lon: 139.6917 } },
    {
      id: "5",
      title: "Sydney, Australia",
      coords: { lat: -33.8688, lon: 151.2093 },
    },
    { id: "6", title: "Rome, Italy", coords: { lat: 41.9028, lon: 12.4964 } },
    { id: "7", title: "Cairo, Egypt", coords: { lat: 30.0444, lon: 31.2357 } },
    {
      id: "8",
      title: "Vienna, Austria",
      coords: { lat: 48.20849, lon: 16.37208 },
    },
    {
      id: "9",
      title: "Moscow, Russia",
      coords: { lat: 55.7558, lon: 37.6176 },
    },
    {
      id: "10",
      title: "Beijing, China",
      coords: { lat: 39.9042, lon: 116.4074 },
    },
    { id: "11", title: "Berlin, Germany", coords: { lat: 52.52, lon: 13.405 } },
    { id: "12", title: "Delhi, India", coords: { lat: 28.7041, lon: 77.1025 } },
    {
      id: "13",
      title: "Singapore, Singapore",
      coords: { lat: 1.3521, lon: 103.8198 },
    },
    { id: "14", title: "Dubai, UAE", coords: { lat: 25.2048, lon: 55.2708 } },
    {
      id: "15",
      title: "São Paulo, Brazil",
      coords: { lat: -23.5505, lon: -46.6333 },
    },
    {
      id: "16",
      title: "Mexico City, Mexico",
      coords: { lat: 19.4326, lon: -99.1332 },
    },
    {
      id: "17",
      title: "Istanbul, Turkey",
      coords: { lat: 41.0082, lon: 28.9784 },
    },
    {
      id: "18",
      title: "Bangkok, Thailand",
      coords: { lat: 13.7563, lon: 100.5018 },
    },
    {
      id: "19",
      title: "Amsterdam, Netherlands",
      coords: { lat: 52.3676, lon: 4.9041 },
    },
    {
      id: "20",
      title: "Toronto, Canada",
      coords: { lat: 43.6532, lon: -79.3832 },
    },
    {
      id: "21",
      title: "Seoul, South Korea",
      coords: { lat: 37.5665, lon: 126.978 },
    },
    {
      id: "22",
      title: "Buenos Aires, Argentina",
      coords: { lat: -34.6037, lon: -58.3816 },
    },
    {
      id: "23",
      title: "Lisbon, Portugal",
      coords: { lat: 38.7223, lon: -9.1393 },
    },
    {
      id: "24",
      title: "Stockholm, Sweden",
      coords: { lat: 59.3293, lon: 18.0686 },
    },
    {
      id: "25",
      title: "Cape Town, South Africa",
      coords: { lat: -33.9249, lon: 18.4241 },
    },
    {
      id: "26",
      title: "Kuala Lumpur, Malaysia",
      coords: { lat: 3.139, lon: 101.6869 },
    },
    {
      id: "27",
      title: "Warsaw, Poland",
      coords: { lat: 52.2297, lon: 21.0122 },
    },
    {
      id: "28",
      title: "Athens, Greece",
      coords: { lat: 37.9838, lon: 23.7275 },
    },
    {
      id: "29",
      title: "Prague, Czech Republic",
      coords: { lat: 50.0755, lon: 14.4378 },
    },
    {
      id: "30",
      title: "Helsinki, Finland",
      coords: { lat: 60.1699, lon: 24.9384 },
    },
    { id: "31", title: "Oslo, Norway", coords: { lat: 59.9139, lon: 10.7522 } },
    { id: "32", title: "Mumbai, India", coords: { lat: 19.076, lon: 72.8777 } },
    {
      id: "33",
      title: "Los Angeles, USA",
      coords: { lat: 34.0522, lon: -118.2437 },
    },
    {
      id: "34",
      title: "Chicago, USA",
      coords: { lat: 41.8781, lon: -87.6298 },
    },
    {
      id: "35",
      title: "Houston, USA",
      coords: { lat: 29.7604, lon: -95.3698 },
    },
    {
      id: "36",
      title: "Madrid, Spain",
      coords: { lat: 40.4168, lon: -3.7038 },
    },
    {
      id: "37",
      title: "Barcelona, Spain",
      coords: { lat: 41.3851, lon: 2.1734 },
    },
    {
      id: "38",
      title: "Brussels, Belgium",
      coords: { lat: 50.8503, lon: 4.3517 },
    },
    {
      id: "39",
      title: "Zurich, Switzerland",
      coords: { lat: 47.3769, lon: 8.5417 },
    },
    {
      id: "40",
      title: "Hong Kong, China",
      coords: { lat: 22.3193, lon: 114.1694 },
    },
    {
      id: "41",
      title: "Jakarta, Indonesia",
      coords: { lat: -6.2088, lon: 106.8456 },
    },
    { id: "42", title: "Lagos, Nigeria", coords: { lat: 6.5244, lon: 3.3792 } },
    { id: "43", title: "Lima, Peru", coords: { lat: -12.0464, lon: -77.0428 } },
    {
      id: "44",
      title: "Santiago, Chile",
      coords: { lat: -33.4489, lon: -70.6693 },
    },
    {
      id: "45",
      title: "Montreal, Canada",
      coords: { lat: 45.5017, lon: -73.5673 },
    },
    {
      id: "46",
      title: "Vancouver, Canada",
      coords: { lat: 49.2827, lon: -123.1207 },
    },
    {
      id: "47",
      title: "San Francisco, USA",
      coords: { lat: 37.7749, lon: -122.4194 },
    },
    { id: "48", title: "Miami, USA", coords: { lat: 25.7617, lon: -80.1918 } },
    { id: "49", title: "Boston, USA", coords: { lat: 42.3601, lon: -71.0589 } },
    {
      id: "50",
      title: "Rio de Janeiro, Brazil",
      coords: { lat: -22.9068, lon: -43.1729 },
    },
  ];

  const [filteredCities, setFilteredCities] = useState(CITIES);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Sort cities alphabetically
    const sortedCities = CITIES.sort((a, b) => a.title.localeCompare(b.title));
    setFilteredCities(sortedCities);

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      if (location) {
        const closestCity = findClosestCity(
          location.coords.latitude,
          location.coords.longitude
        );
        setSelectedCity(closestCity);
        setCity(closestCity.title);
        fetchWeather(closestCity.coords.lat, closestCity.coords.lon);
      }
    })();
  }, []);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => setKeyboardHeight(0)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const findClosestCity = (latitude, longitude) => {
    const getDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Radius of the Earth in km
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
          Math.cos(lat2 * (Math.PI / 180)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c; // Distance in km
      return distance;
    };

    let minDistance = Infinity;
    let closestCity = CITIES[0];

    CITIES.forEach((city) => {
      const distance = getDistance(
        latitude,
        longitude,
        city.coords.lat,
        city.coords.lon
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestCity = city;
      }
    });

    return closestCity;
  };

  useEffect(() => {
    const date = new Date();
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const formattedDate = `${date.getDate()} ${monthNames[date.getMonth()]} `;
    const formattedDay = `${dayNames[date.getDay()]}`;
    setCurrentDate(formattedDate);
    setCurrentDay(formattedDay);
  }, []);

  const fetchWeather = async (latitude, longitude) => {
    try {
      // Fetch current weather data
      const response = await axios.get(
        "https://api.openweathermap.org/data/2.5/weather",
        {
          params: {
            lat: latitude,
            lon: longitude,
            appid: WEATHER_API_KEY,
            units: "metric",
          },
        }
      );

      // Fetch hourly forecast data
      const forecastResponse = await axios.get(
        "https://api.openweathermap.org/data/2.5/forecast",
        {
          params: {
            lat: latitude,
            lon: longitude,
            appid: WEATHER_API_KEY,
            units: "metric",
          },
        }
      );

      // Extract the hourly forecast for the next 24 hours
      const hourlyData = forecastResponse.data.list.slice(0, 8).map((item) => ({
        time: new Date(item.dt * 1000),
        temp: Math.round(item.main.temp),
        icon: item.weather[0].description,
      }));

      setHourlyForecast(hourlyData);

      // Check if the response data is valid
      if (!response.data || !response.data.main) {
        throw new Error("Invalid weather data received");
      }

      const roundedTemp = Math.round(response.data.main.temp);
      const pressure = response.data.main.pressure;
      const weatherDescription = response.data.weather[0].description;
      console.log("Response data:", response);

      setWeatherData({
        ...response.data,
        main: {
          ...response.data.main,
          temp: roundedTemp,
          pressure: pressure,
          description: weatherDescription,
        },
      });

      setIsLoading(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();

      if (weatherDescription.includes("rain")) {
        setRainAlert({
          visible: true,
          message: "Grab your umbrella! Rain is on the way 🌧️",
        });
      } else {
        setRainAlert({ visible: false, message: "" });
      }
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setIsLoading(false);
      setWeatherData(null);
      Alert.alert(
        "Error",
        "Failed to fetch weather data. Please check your connection and try again."
      );
    }
  };

  const handleSendMessage = async () => {
    if (userInput.trim() === "") return;
  
    Keyboard.dismiss();
    setIsMessageLoading(true);
    toggleDrawer(true);
    try {
      const response = await axios.post(
        "http://192.168.50.240:5000/generate_message",
        {
          description: weatherData.weather[0].description,
          temp: weatherData.main.temp,
          humidity: weatherData.main.humidity,
          windSpeed: weatherData.wind.speed,
          hourlyForecast: hourlyForecast,
          userQuery: userInput,
        }
      );
      console.log("Response: ", response);
      setWeatherMessage(response.data.message);
      setIsQuestion(userInput)
      setUserInput(""); 

    } catch (error) {
      console.error("Error fetching weather message:", error);
      setWeatherMessage("Weather's unpredictable, just like this app!");
    } finally {
      setIsMessageLoading(false);
    }
  };

  
  const formatHourTo12Hour = (hour) => {
    const currentHour = new Date().getHours(); // Get current hour
    if (hour === currentHour) return "Now"; // Check if it's the current hour

    const isPM = hour >= 12;
    const formattedHour = hour % 12 || 12;
    return `${formattedHour} ${isPM ? "pm" : "am"}`;
  };

  const getWeatherIcon = (description) => {
    switch (description.toLowerCase()) {
      case "clear sky":
        return { icon: "weather-sunny", color: "#FFD700" }; // Gold
      case "few clouds":
        return { icon: "weather-partly-cloudy", color: "#00BFFF" }; // Deep Sky Blue
      case "scattered clouds":
        return { icon: "weather-cloudy", color: "#007FFF" }; // Azure Radiance
      case "broken clouds":
        return { icon: "weather-cloudy", color: "#007FFF" }; // Azure Radiance
      case "shower rain":
        return { icon: "weather-rainy", color: "#6495ED" }; // Cornflower Blue
      case "rain":
        return { icon: "weather-pouring", color: "#0000FF" }; // Blue
      case "thunderstorm":
        return { icon: "weather-lightning", color: "#800080" }; // Purple
      case "snow":
        return { icon: "weather-snowy", color: "#B0C4DE" }; // Light Steel Blue
      case "mist":
        return { icon: "weather-fog", color: "#C0C0C0" }; // Silver
      default:
        return { icon: "weather-cloudy", color: "#A9A9A9" }; // Dark Gray
    }
  };

  const handleCitySelect = (item) => {
    if (item) {
      fetchWeather(item.coords.lat, item.coords.lon);
      setCity(item.title);
      setSelectedCity(item);
    }
  };

  const invertColorStyle = (isDarkMode) => ({
    tintColor: isDarkMode ? "#fff" : "#000", // Inverse colors for dark mode
  });

  const filterCities = (query) => {
    const filtered = CITIES.filter((city) =>
      city.title.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredCities(filtered);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Ensure weatherData is not null before accessing its properties
  const temperature = weatherData?.main?.temp || 0;
  const humidity = weatherData?.main?.humidity || 0;
  const windSpeed = weatherData?.wind?.speed || 0;
  const pressure = weatherData?.main?.pressure || 0;

  const weatherDescription = weatherData?.main?.description || "Unknown";
  const { icon, color } = getWeatherIcon(weatherDescription);

  const getGradientColors = (temp) => {
    if (temp < 0) return ["#00BFFF", "#1E90FF"];
    if (temp < 10) return ["#1E90FF", "#87CEFA"];
    if (temp < 20) return ["#87CEFA", "#FFD700"];
    if (temp < 30) return ["#FFD700", "#FFA500"];
    return ["#FFA500", "#FF4500"];
  };

  const toggleDrawer = () => {
    if (drawerVisible) {
      Animated.timing(drawerHeight, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => setDrawerVisible(false));
    } else {
      setDrawerVisible(true);
      Animated.timing(drawerHeight, {
        toValue: 220,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const capitalizeDescription = (description) => {
    if (!description) return "";
    return description
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <AutocompleteDropdownContextProvider>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={[styles.container, isDarkMode && styles.darkContainer]}>
          <StatusBar
            translucent
            backgroundColor="transparent"
            barStyle={isDarkMode ? "light-content" : "dark-content"}
          />

          {isLoading ? (
            <LoadingScreen />
          ) : (
            <Animated.View style={{ ...styles.content, opacity: fadeAnim }}>
              <GradientBlob
                weather={weatherDescription}
                temperature={temperature}
                isDarkMode={isDarkMode}
              />

              <View style={styles.header}>
                <View style={styles.searchContainer}>
                  <AutocompleteDropdown
                    clearOnFocus={false}
                    closeOnBlur={true}
                    closeOnSubmit={true}
                    initialValue={{
                      id: selectedCity?.id,
                      title: selectedCity?.title,
                    }}
                    onSelectItem={handleCitySelect}
                    dataSet={filteredCities}
                    onChangeText={filterCities}
                    textInputProps={{
                      placeholder: "Search for your city",
                      autoCorrect: false,
                      autoCapitalize: "none",
                      style: {
                        color: isDarkMode ? "#fff" : "#000",
                        fontFamily: "Poppins-Regular",
                        fontSize: 16,
                        paddingLeft: 16,
                      },
                      placeholderTextColor: "#B0BEC5", // This sets the placeholder text color to blue
                    }}
                    inputContainerStyle={{
                      backgroundColor: "transparent",
                      color: isDarkMode ? "#fff" : "#000",
                      flexGrow: 1,
                      borderColor: isDarkMode ? "#fff" : "#000",
                      borderRadius: 100,
                      padding: 0,
                    }}
                    suggestionsListContainerStyle={{
                      backgroundColor: isDarkMode ? "#111" : "#fff",
                      borderRadius: 20,
                      color: isDarkMode ? "#fff" : "#000",
                      padding: 20,
                      borderColor: isDarkMode ? "#000" : "#000",
                      elevation: 5,
                    }}
                    renderItem={(item) => (
                      <Text
                        style={{
                          color: isDarkMode ? "#fff" : "#000",
                          padding: 15,
                          fontFamily: "Poppins-Regular",
                        }}
                      >
                        {item.title}
                      </Text>
                    )}
                    inputHeight={60}
                    showChevron={false}
                  />
                </View>
                <TouchableOpacity onPress={toggleDarkMode}>
                  <BlurView
                    style={[
                      styles.asteriskContainer,
                      { borderColor: isDarkMode ? "#F6995C" : "#3081D0" },
                      {
                        backgroundColor: isDarkMode
                          ? "transparent"
                          : "transparent",
                      },
                    ]}
                    tint={isDarkMode ? "dark" : "light"}
                    intensity={70}
                    experimentalBlurMethod="dimezisBlurView"
                  >
                    <Text
                      style={[
                        styles.headerText,
                        { color: isDarkMode ? "#F6995C" : "#3081D0" },
                      ]}
                    >
                      *
                    </Text>
                  </BlurView>
                </TouchableOpacity>
              </View>
              <View style={styles.timeDateContainer}>
                <View style={styles.dateDayContainer}>
                  <Text
                    style={[
                      styles.currentDay,
                      { color: isDarkMode ? "#fff" : "#000" },
                    ]}
                  >
                    {currentDay}
                  </Text>
                  <Text
                    style={[
                      styles.currentDate,
                      { color: isDarkMode ? "#fff" : "#000" },
                    ]}
                  >
                    {currentDate}
                  </Text>
                </View>
                {/* <BlurView
                  style={styles.weatherDescriptionContainer}
                  tint={isDarkMode ? "dark" : "light"}
                  experimentalBlurMethod="dimezisBlurView"
                  intensity={70}
                >
                  <MaterialCommunityIcons name={icon} size={24} color={color} />
                  <Text
                    style={[
                      styles.weatherDescriptionText,
                      { color: isDarkMode ? "#fff" : "#000" },
                    ]}
                  >
                    {capitalizeDescription(weatherDescription)}
                  </Text>
                </BlurView> */}
              </View>

              <View style={styles.iconContainer}>
                <BlurView
                  style={styles.weatherDescriptionContainer}
                  tint={isDarkMode ? "dark" : "light"}
                  experimentalBlurMethod="dimezisBlurView"
                  intensity={70}
                >
                  <MaterialCommunityIcons name={icon} size={24} color={color} />
                  <Text
                    style={[
                      styles.weatherDescriptionText,
                      { color: isDarkMode ? "#fff" : "#000" },
                    ]}
                  >
                    {capitalizeDescription(weatherDescription)}
                  </Text>
                </BlurView>

                <View style={styles.weatherIconContainer}></View>

                <View style={styles.weatherInfo}>
                  <Text
                    style={[
                      styles.temperatureText,
                      { color: isDarkMode ? "#fff" : "#000" },
                    ]}
                  >
                    {temperature}°
                  </Text>
                  <View style={styles.additionalInfo}>
                    <BlurView
                      style={styles.infoItem}
                      intensity={70}
                      tint={isDarkMode ? "dark" : "light"}
                      experimentalBlurMethod="dimezisBlurView"
                    >
                      <Image
                        source={WaterPercentIcon}
                        style={[styles.iconImage, invertColorStyle(isDarkMode)]}
                      />
                      <Text
                        style={[
                          {
                            color: isDarkMode ? "#fff" : "#000",
                            fontFamily: "Poppins-Regular",
                            fontSize: 10,
                            letterSpacing: -14 * 0.015,
                          },
                        ]}
                      >
                        Humidity
                      </Text>
                      <Text
                        style={[
                          styles.infoText,
                          { color: isDarkMode ? "#fff" : "#000" },
                        ]}
                      >
                        {Math.round(humidity)}%
                      </Text>
                    </BlurView>
                    <BlurView
                      style={styles.infoItem}
                      intensity={70}
                      tint={isDarkMode ? "dark" : "light"}
                      experimentalBlurMethod="dimezisBlurView"
                    >
                      <Image
                        source={WindyIcon}
                        style={[styles.iconImage, invertColorStyle(isDarkMode)]}
                      />
                      <Text
                        style={[
                          {
                            color: isDarkMode ? "#fff" : "#000",
                            fontFamily: "Poppins-Regular",
                            fontSize: 10,
                            letterSpacing: -14 * 0.015,
                          },
                        ]}
                      >
                        Wind Speed
                      </Text>
                      <Text
                        style={[
                          styles.infoText,
                          { color: isDarkMode ? "#fff" : "#000" },
                        ]}
                      >
                        {Math.round(windSpeed)} m/s
                      </Text>
                    </BlurView>
                    <BlurView
                      style={styles.infoItem}
                      intensity={70}
                      tint={isDarkMode ? "dark" : "light"}
                      experimentalBlurMethod="dimezisBlurView"
                    >
                      <Image
                        source={ThermometerIcon}
                        style={[styles.iconImage, invertColorStyle(isDarkMode)]}
                      />

                      <Text
                        style={[
                          {
                            color: isDarkMode ? "#fff" : "#000",
                            fontFamily: "Poppins-Regular",
                            fontSize: 10,
                            letterSpacing: -14 * 0.015,
                          },
                        ]}
                      >
                        Feels Like
                      </Text>
                      <Text
                        style={[
                          styles.infoText,
                          { color: isDarkMode ? "#fff" : "#000" },
                        ]}
                      >
                        {Math.round(weatherData.main.feels_like)}°
                      </Text>
                    </BlurView>
                  </View>

                  {/* <BlurView
                    style={[styles.hourlyForecastContainer]}
                    tint={isDarkMode ? "dark" : "light"}
                    intensity={70}
                    experimentalBlurMethod="dimezisBlurView"
                  >
                    {hourlyForecast.slice(0, 3).map((item, index) => (
                      <View style={styles.hourlyForecastItem}>
                        <Text
                          style={[
                            styles.hourlyForecastTime,
                            { color: isDarkMode ? "#fff" : "#000" },
                          ]}
                        >
                          {formatHourTo12Hour(item.time.getHours())}
                        </Text>
                        <MaterialCommunityIcons
                          name={getWeatherIcon(item.icon).icon}
                          size={30}
                          color={getWeatherIcon(item.icon).color}
                        />
                        <Text
                          style={[
                            styles.hourlyForecastTemp,
                            { color: isDarkMode ? "#fff" : "#000" },
                          ]}
                        >
                          {item.temp}°
                        </Text>
                      </View>
                    ))}
                  </BlurView> */}
                </View>
              </View>
              <BlurView
                style={[
                  styles.inputContainer,
                  { borderColor: isDarkMode ? "#000" : "#000" },
                ]}
                intensity={70}
                tint={isDarkMode ? "dark" : "light"}
                experimentalBlurMethod="dimezisBlurView"
              >
                <TextInput
                  ref={textInputRef} // Set the ref for the TextInput
                  style={[
                    styles.textInput,
                    { color: isDarkMode ? "#fff" : "#000" },
                    { backgroundColor: isDarkMode ? "#000" : "#fff" },
                  ]}
                  placeholder="Ask me anything"
                  placeholderTextColor={isDarkMode ? "#fff" : "#000"}
                  value={userInput}
                  onChangeText={setUserInput}
                  onBlur={() => textInputRef.current.blur()} // Remove the cursor after sending
                />

                <TouchableOpacity
                  style={[styles.iconButton]}
                  onPress={isRecording ? stopRecording : startRecording}
                >
                  <Image
                    source={require("./assets/icons/mic.png")}
                    style={[
                      styles.iconImage,
                      invertColorStyle(isDarkMode),
                      isRecording && styles.activeIcon,
                    ]}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.iconButton]}
                  onPress={handleSendMessage}
                  disabled={isLoading}
                >
                  <Image
                    source={SendIcon}
                    style={[styles.iconImage, invertColorStyle(isDarkMode)]}
                  />
                </TouchableOpacity>
              </BlurView>
              {drawerVisible && (
                <Animated.View
                  style={[
                    styles.drawerContainer,
                    {
                      height: drawerHeight,
                      opacity: drawerHeight.interpolate({
                        inputRange: [0, 200],
                        outputRange: [0, 1],
                      }),
                    },
                  ]}
                >
                  <BlurView
                    style={[
                      StyleSheet.absoluteFill,
                      {
                        justifyContent: "center",
                        alignItems: "center",
                        overflow: "hidden",
                      },
                    ]}
                    intensity={70}
                    tint={isDarkMode ? "dark" : "light"}
                    experimentalBlurMethod="dimezisBlurView"
                  >
                    <TouchableOpacity
                      onPress={toggleDrawer}
                      style={styles.cancelButton}
                    >
                      <MaterialCommunityIcons
                        name="close"
                        size={24}
                        color={isDarkMode ? "#fff" : "#000"}
                      />
                    </TouchableOpacity>

                    <View style={styles.drawerContent}>
                      <Text
                        style={[
                          styles.drawerQuestionText,
                          { color: isDarkMode ? "#888" : "#888" },
                          { paddingTop: 20 , paddingHorizontal: 16 },
                        ]}
                      >
                        {isQuestion}
                      </Text>
                      {isMessageLoading ? (
                        <ActivityIndicator size="large" color="#0000ff" />
                      ) : (
                        <Text
                          style={[
                            styles.drawerAnswerText,
                            { color: isDarkMode ? "#fff" : "#000" },
                            { padding: 16 },
                          ]}
                        >
                          {weatherMessage}
                        </Text>
                      )}
                    </View>
                  </BlurView>
                </Animated.View>
              )}
            </Animated.View>
          )}
        </View>
      </KeyboardAvoidingView>
    </AutocompleteDropdownContextProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
  },
  darkContainer: {
    backgroundColor: "#000",
  },
  content: {
    flex: 1,
  },
  iconImage: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },

  line: {
    borderWidth: 1,
    backgroundColor: "#000",
    borderColor: "#000",
    marginVertical: 10,
    marginTop: 10,
  },
  header: {
    marginTop: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    borderColor: "#000",
    backgroundColor: "transparent",
  },
  asteriskContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 60,
    height: 60,
    borderRadius: 100,
    borderColor: "#000",
    backgroundColor: "#fff",
    borderWidth: 1,
    overflow: "hidden",
  },
  searchContainer: {
    flex: 1,
  },
  headerText: {
    fontSize: 50,
  },
  iconContainer: {
    flex: 1,
    marginTop: 16,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    padding: 10,
  },
  additionalInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    alignItems: "center",
    gap: 5,
  },

  infoItem: {
    alignItems: "center",
    borderColor: "#000",
    padding: 10,
    borderRadius: 20,
    width: "30%",
    justifyContent: "center",
    overflow: "hidden",
  },
  infoText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
    marginTop: 10,
    color: "#000",
  },

  weatherIconContainer: {
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },

  weatherInfo: {
    alignItems: "center",
  },

  weatherDescription: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    marginLeft: 10,
  },

  temperatureText: {
    fontSize: 150,
    fontFamily: "Poppins-Bold",
    letterSpacing: -150 * 0.05,
    marginTop: -10,
    marginBottom: -10,
  },

  hourlyForecastContainer: {
    paddingVertical: 10,
    overflow: "hidden",
    borderRadius: 20,
    flexDirection: "row",
    marginTop: 16,
    justifyContent: "space-between",
    width: "80%",
  },
  hourlyForecastItem: {
    alignItems: "center",
    marginHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 20,
    overflow: "hidden",
    padding: 10,
    width: "30%",
  },
  hourlyForecastTime: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    marginBottom: 5,
  },
  hourlyForecastTemp: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    marginTop: 5,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 100,
    overflow: "hidden",
  },
  drawerContainer: {
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    overflow: "hidden",
  },
  cancelButton: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "transparent",
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButtonText: {
    display: "none",
  },
  textInput: {
    flex: 1,
    height: 60,
    color: "#000",
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    borderRadius: 100,
    paddingHorizontal: 16,
    overflow: "hidden",
    borderColor: "#000",
  },
  iconButton: {
    marginLeft: 8,
    alignItems: "center",
    margin: 10,
  },
  drawerContent: {
    alignItems: "left",
    justifyContent: "center",
  },
  drawerQuestionText: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    lineHeight: 24,
  },
  drawerAnswerText: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    lineHeight: 22,
  },

  drawer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: "#000",
    elevation: 5,
  },
  activeIcon: {
    tintColor: "red",
  },

  timeDateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
    paddingHorizontal: 16,
  },

  dateDayContainer: {
    flexDirection: "column",
    alignItems: "flex-start", // Align text to the left
  },

  currentDay: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    lineHeight: 20,
    color: "#000", // Example color, replace as needed
  },

  currentDate: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    lineHeight: 20,
    color: "#000", // Example color, replace as needed
  },

  currentTime: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    lineHeight: 20,
    color: "#000", // Example color, replace as needed
  },

  weatherDescriptionText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
  },
  weatherDescriptionContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderColor: "#000",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    overflow: "hidden",
  },
});

export default WeatherScreen;
