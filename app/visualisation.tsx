"use client";
import React from "react";
import * as d3 from "d3";
import CustomMap from "../app/components/Map"

import geoJSON from "../app/components/data.json";
import { weatherStations } from "../app/components/weatherdata"; // Import weatherStations


export default function Map() {
    return (
        <div className="CustomMap">
            <CustomMap title="Map of Australia and Weather Stations" data={geoJSON} stations={weatherStations}/>
        </div>
    );
}