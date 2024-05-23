import React, { useState, useEffect, useRef } from "react";
import "./App.css";
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

interface WeatherData {
  location?: {
    name? : string;
  };
  current?: {
    condition?: {
      text: string;
    };
    temp_c: number;
    feelslike_c: number;
    wind_kph: number;
    humidity: number;
  };
  forecast?: {
    forecastday?: {
      day?: {
        maxtemp_c: number;
        mintemp_c: number;
      };
      astro?: {
        sunrise: string;
        sunset: string;
      };
    }[];
  };
}

function App() {
  const [city, setCity] = useState<WeatherData>();
  const [data, setData] = useState<WeatherData>();
  
  const inputRef = useRef<HTMLInputElement>();

  useEffect(() => {
    const fetchData = async () => {
      if (city) {
        const current = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${city}&aqi=yes`;
        const forecast = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city}&aqi=yes`;
        try {
          const response1 = await fetch(current);
          const data1 = await response1.json();
          const response2 = await fetch(forecast);
          const data2 = await response2.json();
          setData({ ...data1, ...data2 });
        } catch (error) {
          console.error("Error:", error);
        }
      }
    };
    fetchData();
  }, [city]);

  const LOCATION = !city
    ? "Location"
    : city
    // : `${city.charAt(0).toUpperCase() + city.slice(1)}`;

  const CONDITION = !data
    ? "Condition"
    : `Condition: ${data?.current?.condition?.text}`;

  const TEMPERATURE = !data
    ? "Temperature"
    : data?.current?.temp_c > 0
    ? `Temp: +${data?.current?.temp_c} c°`
    : data?.current?.temp_c < 0
    ? `Temp: -${data?.current?.temp_c} c°`
    : `Temp: ${data?.current?.temp_c} c°`;

  const TEMP_FEELS_LIKE = !data
    ? "Temperature feels like"
    : Math.round(data?.current?.feelslike_c) > 0
    ? `Feels like: +${Math.round(data?.current?.feelslike_c)} c°`
    : Math.round(data?.current?.feelslike_c) < 0
    ? `Feels like: -${Math.round(data?.current?.feelslike_c)} c°`
    : `Feels like: ${Math.round(data?.current?.feelslike_c)} c°`;

  const TEMP_MAX = !data
    ? "Max Temperature"
    : data?.forecast?.forecastday?.map((i) => i?.day?.maxtemp_c) > 0
    ? `Max Temp: +${data?.forecast?.forecastday?.map((i) =>
        Math.round(i?.day?.maxtemp_c)
      )} c°`
    : data?.forecast?.forecastday?.map((i) => i?.day?.maxtemp_c) < 0
    ? `Max Temp: -${data?.forecast?.forecastday?.map((i) =>
        Math.round(i?.day?.maxtemp_c)
      )} c°`
    : `Max Temp: ${data?.forecast?.forecastday?.map((i) =>
        Math.round(i?.day?.maxtemp_c)
      )} c°`;

  const TEMP_MIN = !data
    ? "Min Temperature"
    : data?.forecast?.forecastday?.map((i) => i?.day?.mintemp_c) > 0
    ? `Min Temp: +${data?.forecast?.forecastday?.map((i) =>
        Math.round(i?.day?.mintemp_c)
      )} c°`
    : data?.forecast?.forecastday?.map((i) => i?.day?.mintemp_c) < 0
    ? `Min Temp: -${data?.forecast?.forecastday?.map((i) =>
        Math.round(i?.day?.mintemp_c)
      )} c°`
    : `Min Temp: ${data?.forecast?.forecastday?.map((i) =>
        Math.round(i?.day?.mintemp_c)
      )} c°`;

  const WIND_KPH = !data
    ? "Wind"
    : `Wind: ${Math.round(data?.current?.wind_kph)} kph`;

  const HUMIDITY = !data
    ? "Humidity"
    : `Humidity: ${Math.round(data?.current?.humidity)}%`;

  const SUNRISE = !data
    ? "Sunrise"
    : `Sunrise: ${data?.forecast?.forecastday?.map((i) => i?.astro?.sunrise)}`;

  const SUNSET = !data
    ? "Sunset"
    : `Sunset: ${data?.forecast?.forecastday?.map((i) => i?.astro?.sunset)}`;

const inputCity = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const cityValue = inputRef.current?.value;
  if (cityValue) {
    setCity(cityValue);
  }
};

  return (
    <div className="container">
      <h1 className="location">{LOCATION}</h1>
      <div className="condition">{CONDITION}</div>
      <div className="temperature">{TEMPERATURE}</div>
      <div className="temp-feelslike">{TEMP_FEELS_LIKE}</div>
      <div className="temperature">{TEMP_MAX}</div>
      <div className="temperature">{TEMP_MIN}</div>
      <div className="wind-speed">{WIND_KPH}</div>
      <div className="air-humidity">{HUMIDITY}</div>
      <div className="condition">{SUNRISE}</div>
      <div className="condition">{SUNSET}</div>
      <form onSubmit={inputCity}>
        <input
          type="text"
          placeholder="Type a Location"
          id="name"
          name="name"
          required
          autoFocus
          ref={inputRef}
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default App;
