import React, { useState, useEffect, useRef, FC } from "react";
import { FiSunset, FiSunrise } from "react-icons/fi";
import {
  // FaTemperatureArrowUp,
  FaTemperatureHalf,
  // FaTemperatureArrowDown,
} from "react-icons/fa6";
import { WiHumidity, WiStrongWind, WiDirectionUp } from "react-icons/wi";
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
  console.log(LOCAL_TIME);
  const COUNTRY = data?.location.country;
  const CONDITION = data?.current.condition.text;
  const ICON = data && `https:${data?.current.condition.icon}`;
  const SUN_ICON =
    data && `https://cdn.weatherapi.com/weather/64x64/day/113.png`;
  const TEMPERATURE = data && `${Math.round(data.current.temp_c)}`;
  // const PERCEIVED_TEMP =
  //   data && `Perceived: ${Math.round(data.current.feelslike_c)}`;
  // const TEMP_MIN =
  //   data &&
  //   `${data?.forecast.forecastday.map((i) => Math.round(i.day.mintemp_c))} – `;
  // const TEMP_MAX =
  //   data &&
  //   `${data?.forecast.forecastday.map((i) => Math.round(i.day.maxtemp_c))}`;
  const WIND_MS =
    data && `${Math.round(data?.current.wind_kph / 3.6) ?? ""} m/s`;
  const WIND_DIR = data && `${data?.current.wind_dir}`;
  console.log(WIND_DIR);
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
    const time = data ? new Date(data.location.localtime) : new Date();
    console.log(time);
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

  const windDirection = () => {
    if (data && WIND_DIR === "N") return "0deg";
    if (data && WIND_DIR === "NNE") return "22.5deg";
    if (data && WIND_DIR === "NE") return "45deg";
    if (data && WIND_DIR === "ENE") return "67.5deg";
    if (data && WIND_DIR === "E") return "90deg";
    if (data && WIND_DIR === "ESE") return "112.5deg";
    if (data && WIND_DIR === "SE") return "135deg";
    if (data && WIND_DIR === "SSE") return "157.5deg";
    if (data && WIND_DIR === "S") return "180deg";
    if (data && WIND_DIR === "SSW") return "202.5deg";
    if (data && WIND_DIR === "SW") return "225deg";
    if (data && WIND_DIR === "WSW") return "247.5deg";
    if (data && WIND_DIR === "W") return "270deg";
    if (data && WIND_DIR === "WNW") return "292.5deg";
    if (data && WIND_DIR === "NW") return "315deg";
    if (data && WIND_DIR === "NNW") return "337.5deg";
  };

  const windRotation =
    {
      N: "0deg",
    }?.[WIND_DIR ?? ""] ?? "n.a.";

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
                  <div className="temp-icons">
                    <div className="icon-thermometer">
                      <FaTemperatureHalf />
                    </div>
                    <div className="temps">{TEMPERATURE}</div>
                  </div>
                  <div className="wind-speed-dir">
                    <div
                      className="wind-direction-icon"
                      style={{
                        rotate: `${windDirection()}`,
                      }}
                    >
                      <span className="arrow-icon">
                        <WiDirectionUp />
                      </span>
                    </div>
                    <span>
                      <WiStrongWind />
                    </span>
                    <div className="wind-speed">{WIND_MS}</div>
                    <div className="wind-dir">{WIND_DIR}</div>
                  </div>
                  <div className="air-humidity">
                    <span>{HUMIDITY}</span>
                    <span className="humidity-icon">
                      <WiHumidity />
                    </span>
                  </div>
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
                  <div className="temp-icons">
                    <div className="icon-thermometer">
                      <FaTemperatureHalf />
                    </div>
                    <div className="temps">{TEMPERATURE}</div>
                  </div>
                  <div className="wind-speed-dir">
                    <span>
                      <WiStrongWind />
                    </span>
                    <div className="wind-speed">{WIND_MS}</div>
                    <div className="wind-dir">{WIND_DIR}</div>
                  </div>
                  <div className="air-humidity">
                    <span>{HUMIDITY}</span>
                    <span className="humidity-icon">
                      <WiHumidity />
                    </span>
                  </div>
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
          {/* <div className="perceived">
            {PERCEIVED_TEMP}
            <span>
              <FaTemperatureHalf />
            </span>
          </div> */}
          {/* <div className="temp-min-max">
            <span>
              <FaTemperatureArrowDown />
            </span>
            {TEMP_MIN}
            {TEMP_MAX}
            <span>
              <FaTemperatureArrowUp />
            </span>
          </div> */}
        </>
      ) : (
        <h2>LOADING...</h2>
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
