import React, { useState, useEffect, useRef } from "react";
import "./App.css";
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

interface WeatherData {
  location: {
    name: string;
    country: string;
  };
  current: {
    condition: {
      text: string;
      icon: string;
    };
    temp_c: number;
    feelslike_c: number;
    wind_kph: number;
    wind_dir: string;
    humidity: number;
  };
  forecast: {
    forecastday: {
      // date: string;
      day: {
        maxtemp_c: number;
        mintemp_c: number;
      };
      astro: {
        sunrise: string;
        sunset: string;
        moonrise: string;
        moonset: string;
      };
      hour: {
        time: string;
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

  const LOCATION = data?.location.name;

  const COUNTRY = data?.location.country;

  const CONDITION = data?.current.condition.text;

  const ICON = data && `https:${data?.current.condition.icon}`;

  const SUN_ICON =
    data && `https://cdn.weatherapi.com/weather/64x64/day/113.png`;

  const TEMPERATURE = data && `Temp: ${Math.round(data.current.temp_c)}c°`;

  const PERCEIVED_TEMP =
    data && `Perceived Temp: ${Math.round(data.current.feelslike_c)}c°`;

  const TEMP_MIN =
    data &&
    `${data?.forecast.forecastday.map((i) =>
      Math.round(i.day.mintemp_c)
    )}c° – `;

  const TEMP_MAX =
    data &&
    `${data?.forecast.forecastday.map((i) => Math.round(i.day.maxtemp_c))}c°`;

  const WIND_KPH = data && `Wind: ${data?.current.wind_kph ?? ""} kph`;

  const WIND_DIR = data && `Wind Direction: ${data?.current.wind_dir}`;

  const HUMIDITY = data && `Humidity: ${data?.current.humidity ?? ""}%`;

  const SUNRISE =
    data && `${data?.forecast.forecastday.map((i) => i.astro.sunrise)} – `;

  const SUNSET = data && data?.forecast.forecastday.map((i) => i.astro.sunset);

  const MOONRISE =
    data && `${data?.forecast.forecastday.map((i) => i.astro.moonrise)} – `;

  const MOONSET =
    data && data?.forecast.forecastday.map((i) => i.astro.moonset);

  // const HOURS =
  //   data && data?.forecast.forecastday.map((i) => i.hour).map((h) => h.time);

  // console.log("HOURS:", HOURS);

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
      <h2 className="country">{COUNTRY}</h2>
      <div className="condition">
        {CONDITION}
        <img src={ICON} alt="" />
      </div>
      <div className="temperature">{TEMPERATURE}</div>
      <div className="perseived">{PERCEIVED_TEMP}</div>
      <div className="temp-min-max">
        {TEMP_MIN}
        {TEMP_MAX}
      </div>
      <div className="wind-speed">{WIND_KPH}</div>
      <div className="wind-dir">{WIND_DIR}</div>
      <div className="air-humidity">{HUMIDITY}</div>
      <div className="sunrise-sunset">
        <img src={SUN_ICON} />
        {SUNRISE}
        {SUNSET}
      </div>
      <div className="moonrise-moonset">
        {MOONRISE}
        {MOONSET}
      </div>
      {/* <div className="hours">{HOURS}</div> */}
      <form className="form" onSubmit={inputCity}>
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
