"use client";
import React from "react";
import * as d3 from "d3";
import CustomMap from "../app/components/Map"

import geoJSON from "./assets/australia_data.json";


export default function Map() {
    return (
        <div className="Map">
            <CustomMap title="Australia" data={geoJSON} />
        </div>
    );
}