"use client";
import React from "react";
import * as d3 from "d3";
import CustomMap from "../app/components/Map"

import geoJSON from "./assets/australia_data.json";


export default function Map() {
    return (
        <div className="CustomMap">
            <CustomMap title="Map of Australia and Weather Stations" data={geoJSON} />
        </div>
    );
}