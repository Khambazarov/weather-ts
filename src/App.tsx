import React, { useState, useEffect, useRef } from "react";
import "./App.css";
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

interface WeatherData {
  location: {
    name: string;
    country: string;
    localtime: string;
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
      };
      hour: {
        time: [];
      };
    }[];
  };
}

const App = () => {
  const [initialized, setInitialized] = useState(false);
  const [city, setCity] = useState("");
  const [data, setData] = useState<WeatherData>();

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async (city: string) => {
      const current = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${city}&aqi=no`;
      const forecast = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city}&days=1&aqi=no&alerts=no`;
      try {
        const response1 = await fetch(current);
        const data1 = await response1.json();
        const response2 = await fetch(forecast);
        const data2 = await response2.json();
        setData({ ...data1, ...data2 });
      } catch (error) {
        console.error("Error:", error);
      }
    };

    if (!initialized) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchData(`${latitude},${longitude}`);
          setInitialized(true);
        },
        (error) => {
          console.error("Error:", error);
          fetchData("Sydney");
          setInitialized(true);
        }
      );
    }
    if (city) {
      fetchData(city);
    }
  }, [initialized, city]);

  const LOCATION = data?.location.name;
  const LOCAL_TIME = data?.location.localtime.split(" ")[1];
  // const TIME_FOR_CIRCLE = data?.location.localtime;
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
    data &&
    `${
      data?.forecast.forecastday
        .map((i) => i.astro.sunrise)
        .join("")
        .split(" ")[0]
    }`;
  const sunsetConvertTo24Hours = () => {
    const timeSplitting =
      data &&
      data?.forecast.forecastday
        .map((i) => i.astro.sunset)
        .join("")
        .split(" ")[0];
    const getMinuts = timeSplitting?.split(":")[1];
    const convertHourTo24 = Number(timeSplitting?.split(":")[0]) + 12;
    const joinTime = `${convertHourTo24}:${getMinuts}`;
    return joinTime;
  };

  const calculateSunAngle = () => {
    let init = 0;
    const day = 24 * 60;
    const circle = 360;
    // let PI = Math.PI * 2;
    const timeSplitting = data && data?.location.localtime.split(" ")[1];
    const minut = Number(timeSplitting?.split(":")[1]);
    const hour = Number(timeSplitting?.split(":")[0]) * 60;
    const convertedCurrentTime = hour + minut;
    const result = (convertedCurrentTime / day) * circle;
    init = result;
    return init;
  };

  let init = 0;
  const day = 24 * 60;
  const circle = 360;
  // let PI = Math.PI * 2;
  const timeSplitting = data && data?.location.localtime.split(" ")[1];
  const minut = Number(timeSplitting?.split(":")[1]);
  const hour = Number(timeSplitting?.split(":")[0]) * 60;
  const convertedCurrentTime = hour + minut;
  const result = (convertedCurrentTime / day) * circle;
  init = result;
  console.log(init);

  const inputCity = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const cityValue = inputRef.current?.value;
    if (cityValue) {
      setCity(cityValue);
    }
  };

  return (
    <div className="container">
      {data && (
        <>
          <h1 className="location">{LOCATION}</h1>
          <h2 className="country">{COUNTRY}</h2>
          <div className="sunrise-sunset circle">
            <img
              className="sun"
              src={SUN_ICON}
              style={{
                top: `calc(50% - 2rem - sin(${calculateSunAngle()}) * 50%)`,
                left: `calc(50% - 2rem - cos(${calculateSunAngle()}) * 50%)`,
              }}
            />
            <div className="day-time">
              <span>{SUNRISE}</span>
              <span>{LOCAL_TIME}</span>
              <span>{data && sunsetConvertTo24Hours()}</span>
            </div>
          </div>
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
        </>
      )}
      <form className="form" onSubmit={inputCity}>
        <input
          type="text"
          placeholder="Location"
          id="name"
          name="name"
          required
          autoFocus
          ref={inputRef}
          autoComplete="off"
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default App;
