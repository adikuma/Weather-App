import 'react-native-gesture-handler';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AppLoading from 'expo-app-loading'; 
import * as Font from 'expo-font';
import WeatherScreen from './WeatherScreen';

const Stack = createStackNavigator();

const loadFonts = () => {
  return Font.loadAsync({
    'Poppins-SemiBold': require('./assets/fonts/Poppins/Poppins-SemiBold.otf'),
    'Poppins-Bold': require('./assets/fonts/Poppins/Poppins-Bold.otf'),
    'Poppins-Regular': require('./assets/fonts/Poppins/Poppins-Regular.otf'),
  });
};

const App = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        await loadFonts();
      } catch (e) {
        console.warn(e);
      } finally {
        setFontsLoaded(true);
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>

        <Stack.Screen name="Weather" component={WeatherScreen} />
      </Stack.Navigator>
    </NavigationContainer>

  );
};

export default App;
