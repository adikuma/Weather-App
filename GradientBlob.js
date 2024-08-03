import React from 'react';
import { View } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';

const GradientBlob = ({ weather, temperature, isDarkMode }) => {
  const getGradientColors = (weather, temp, isDarkMode) => {
    if (isDarkMode) {
      if (weather.includes('clear') || weather.includes('sunny')) {
        return ['#FFD700', '#FFA500'];
      } else if (weather.includes('cloud')) {
        return ['#87CEEB', '#4682B4'];
      } else if (weather.includes('rain')) {
        return ['#4682B4', '#000080'];
      } else if (weather.includes('snow')) {
        return ['#E0FFFF', '#B0E0E6'];
      } else {
        return ['#F0F0F0', '#D3D3D3'];
      }
    } else {
      if (weather.includes('clear') || weather.includes('sunny')) {
        return ['#FFD700', '#FFA500'];
      } else if (weather.includes('cloud')) {
        return ['#87CEEB', '#4682B4'];
      } else if (weather.includes('rain')) {
        return ['#4682B4', '#000080'];
      } else if (weather.includes('snow')) {
        return ['#E0FFFF', '#B0E0E6'];
      } else {
        return ['#F0F0F0', '#D3D3D3'];
      }
    }
  };

  const [color1, color2] = getGradientColors(weather, temperature, isDarkMode);
  const finalColor = isDarkMode ? '#000000' : '#FFFFFF';

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}}>
      <Svg height="200%" width="250%" viewBox="0 0 100 100">
        <Defs>
          <RadialGradient id="grad" cx="50%" cy="50%" rx="50%" ry="50%" fx="50%" fy="50%">
            <Stop offset="0%" stopColor={color1} stopOpacity="1" />
            <Stop offset="0%" stopColor={color2} stopOpacity="1" />
            <Stop offset="100%" stopColor={finalColor} stopOpacity="1" />
          </RadialGradient>
        </Defs>
        <Circle
          cx="48"
          cy="25"
          r="50"
          fill="url(#grad)"
        >
        </Circle>
      </Svg>
    </View>
  );
};

export default GradientBlob;
