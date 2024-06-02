import React, { useState, useEffect, useRef, FC } from "react";
import { FiSunset, FiSunrise } from "react-icons/fi";
import {
  FaTemperatureArrowUp,
  FaTemperatureHalf,
  FaTemperatureArrowDown,
} from "react-icons/fa6";
import { WiHumidity } from "react-icons/wi";
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

const App: FC = () => {
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
      } catch (error: unknown) {
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
        (error: unknown) => {
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

  const LOCATION = data?.location?.name;
  const LOCAL_TIME = data?.location.localtime.split(" ")[1];
  const COUNTRY = data?.location.country;
  const CONDITION = data?.current.condition.text;
  const ICON = data && `https:${data?.current.condition.icon}`;
  const SUN_ICON =
    data && `https://cdn.weatherapi.com/weather/64x64/day/113.png`;
  const TEMPERATURE = data && `${Math.round(data.current.temp_c)}`;
  const PERCEIVED_TEMP =
    data && `Perceived: ${Math.round(data.current.feelslike_c)}`;
  const TEMP_MIN =
    data &&
    `${data?.forecast.forecastday.map((i) => Math.round(i.day.mintemp_c))} – `;
  const TEMP_MAX =
    data &&
    `${data?.forecast.forecastday.map((i) => Math.round(i.day.maxtemp_c))}`;
  const WIND_KPH = data && `Wind: ${data?.current.wind_kph ?? ""} kph`;
  const WIND_DIR = data && `Wind Direction: ${data?.current.wind_dir}`;
  const HUMIDITY = data && `${data?.current.humidity ?? ""}`;
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

  const sunriseTimeConvertToNumber = () => {
    const timeSplitting =
      data &&
      data?.forecast.forecastday
        .map((i) => i.astro.sunrise)
        .join("")
        .split(" ")[0];
    const getMinuts = timeSplitting?.split(":")[1];
    const convertHourTo24 =
      Number(timeSplitting?.split(":")[0]) * 60 + Number(getMinuts);
    return convertHourTo24;
  };

  const calculateSunAngle = () => {
    const DAY = 24 * 60;
    const CIRCLE = Math.PI * 4;
    const timeSplitting = data && data?.location.localtime.split(" ")[1];
    const convertedMinutes = Number(timeSplitting?.split(":")[1]);
    const convertedHour = Number(timeSplitting?.split(":")[0]) * 60 + 180; // +180 Minuten = 90deg ?? muss andere lösung finden!
    const currentTimeInMinuts = convertedHour + convertedMinutes;
    const result = (currentTimeInMinuts / DAY) * CIRCLE;
    return result;
  };

  const inputCity = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const cityValue = inputRef.current?.value;
    if (cityValue) {
      setCity(cityValue);
    }
  };

  const localTimeConvertToNumber = () => {
    const getMinutes = Number(LOCAL_TIME?.split(":")[1]);
    const getHours = Number(LOCAL_TIME?.split(":")[0]);
    return getHours * 60 + getMinutes;
  };

  return (
    <div className="container">
      {LOCATION ? (
        <>
          <h1 className="location">{LOCATION}</h1>
          <h2 className="country">{COUNTRY}</h2>
          {sunriseTimeConvertToNumber > localTimeConvertToNumber ? (
            <div
              className="sunrise-sunset circle"
              style={{ borderColor: "rgba(255, 223, 25, 1)" }}
            >
              <img
                className="sun"
                src={SUN_ICON}
                style={{
                  top: `calc(50% - 2rem - sin(${calculateSunAngle()}) * 50%)`,
                  left: `calc(50% - 2rem - cos(${calculateSunAngle()}) * 50%)`,
                }}
              />
              <div className="day-time">
                <div className="sun-icons-wrapper">
                  <FiSunrise />
                  <span>{SUNRISE}</span>
                </div>
                <div className="local-temp">
                  <span className="temp">{TEMPERATURE}</span>
                  <span>
                    <FaTemperatureHalf />
                  </span>
                </div>
                <div className="sun-icons-wrapper">
                  <FiSunset />
                  <span>{data && sunsetConvertTo24Hours()}</span>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="sunrise-sunset circle"
              style={{ borderColor: "rgba(255, 223, 25, 0.5)" }}
            >
              <img
                className="sun"
                src={SUN_ICON}
                style={{
                  top: `calc(50% - 2rem - sin(${calculateSunAngle()}) * 50%)`,
                  left: `calc(50% - 2rem - cos(${calculateSunAngle()}) * 50%)`,
                }}
              />
              <div className="day-time">
                <div className="sun-icons-wrapper">
                  <FiSunrise />
                  <span>{SUNRISE}</span>
                </div>
                <div className="local-temp">
                  <span className="temp">{TEMPERATURE}</span>
                  <span>
                    <FaTemperatureHalf />
                  </span>
                </div>
                <div className="sun-icons-wrapper">
                  <FiSunset />
                  <span>{data && sunsetConvertTo24Hours()}</span>
                </div>
              </div>
            </div>
          )}
          <div className="condition">
            {CONDITION}
            <img src={ICON} alt="" />
          </div>
          <div className="perceived">
            {PERCEIVED_TEMP}
            <span>
              <FaTemperatureHalf />
            </span>
          </div>
          <div className="temp-min-max">
            <span>
              <FaTemperatureArrowDown />
            </span>
            {TEMP_MIN}
            {TEMP_MAX}
            <span>
              <FaTemperatureArrowUp />
            </span>
          </div>
          <div className="wind-speed">{WIND_KPH}</div>
          <div className="wind-dir">{WIND_DIR}</div>
          <div className="air-humidity">
            <span>{HUMIDITY}</span>
            <span>
              <WiHumidity />
            </span>
          </div>
        </>
      ) : (
        <h2>NOT FOUND, TRY ANOTHER LOCATION...</h2>
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
