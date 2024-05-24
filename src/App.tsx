import React, { useState, useEffect, useRef } from "react";
import "./App.css";
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

interface WeatherData {
  location: {
    name: string;
  };
  current: {
    condition: {
      text: string;
    };
    temp_c: number;
    feelslike_c: number;
    wind_kph: number;
    humidity: number;
  };
  forecast: {
    forecastday: {
      day: {
        maxtemp_c: number;
        mintemp_c: number;
      };
      astro: {
        sunrise: string;
        sunset: string;
      };
    }[];
  };
}

function App() {
  const [city, setCity] = useState("");
  const [data, setData] = useState<WeatherData>();

  const inputRef = useRef<HTMLInputElement>(null);

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
    // abort signal
  }, [city]);

  const LOCATION = data?.location.name ?? "Location";
  const CONDITION = data?.current.condition.text ?? "Condition";
  const WIND_KPH = `Wind: ${data?.current.wind_kph ?? ""} kph`;
  const HUMIDITY = `Humidity: ${data?.current.humidity ?? ""}%`;
  const SUNRISE = data?.forecast.forecastday
    ? `Sunrise: ${data.forecast.forecastday.map((i) => i.astro.sunrise)}`
    : "Sunrise";
  const SUNSET = data?.forecast.forecastday
    ? `Sunset: ${data.forecast.forecastday.map((i) => i.astro.sunset)}`
    : "Sunset";

  const TEMPERATURE =
    data?.current.temp_c === undefined
      ? "Tempreture"
      : `Temp: ${data.current.temp_c > 0 ? "+" : ""}${Math.round(
          data.current.temp_c
        )}c°`;

  const TEMP_FEELS_LIKE =
    data?.current.feelslike_c === undefined
      ? "Temperature feels like"
      : `Feels like: ${data.current.feelslike_c > 0 ? "+" : ""}${Math.round(
          data.current.feelslike_c
        )}c°`;

  const TEMP_MAX =
    data?.forecast.forecastday === undefined
      ? "Max Temperature"
      : `Max-Temp: ${data.forecast.forecastday.map((i) =>
          i.day.maxtemp_c > 0 ? "+" : ""
        )}${data.forecast.forecastday.map((i) =>
          Math.round(i.day.maxtemp_c)
        )}c°`;

  const TEMP_MIN =
    data?.forecast.forecastday === undefined
      ? "Min Temperature"
      : `Min-Temp: ${data.forecast.forecastday.map((i) =>
          i.day.mintemp_c > 0 ? "+" : ""
        )}${data.forecast.forecastday.map((i) =>
          Math.round(i.day.mintemp_c)
        )}c°`;

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
          placeholder="Location"
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
