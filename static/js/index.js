import {update, hourlyWeather, nowAirQuality, forecastWeather, nowWeather} from "./functions.js";
import {getLocation, map} from "./map.js";

update([
    hourlyWeather,
    nowWeather,
    nowAirQuality,
    forecastWeather
]);