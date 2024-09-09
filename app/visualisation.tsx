"use client";
import React, { useEffect, useState } from "react";
import CustomMap from "../app/components/Map";
import geoJSON from "../app/components/data.json";
import { WeatherStation } from "../app/components/weatherdata"; // Import WeatherStation type

export default function Map() {
    const [weatherStations, setWeatherStations] = useState<WeatherStation[]>([]); // Specify type for state

    useEffect(() => {
        // Fetch weather stations dynamically from the server-side API route
        const fetchWeatherStations = async () => {
            try {
                const response = await fetch("/api/weather"); // Fetch from API route
                if (response.ok) {
                    const data: WeatherStation[] = await response.json(); // Ensure data type matches
                    console.log("Fetched weather stations:", data);  // Log data for debugging
                    setWeatherStations(data); // Update state with the weather data
                } else {
                    console.error("Failed to fetch weather stations:", response.status);
                }
            } catch (error) {
                console.error("Error fetching weather stations:", error);  // Log any errors
            }
        };

        fetchWeatherStations();
    }, []);

    return (
        <div className="CustomMap">
            <CustomMap title="Map of Australia and Weather Stations" data={geoJSON} stations={weatherStations} />
        </div>
    );
}
