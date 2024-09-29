import Image from "next/image";
import Map from "./visualisation";
import React from "react";

export default function Home() {
  return (
    <main>
      <div className="w-full h-screen bg-[#000009]">
        {/* Container */}
        <div className="max-w-[750px] mx-auto px-8 flex flex-col justify-center h-full items-center">
          <h2 className="text-5xl sm:text-7xl font-bold text-[#215B7A] py-1">
            Interactive Map
          </h2>
          <h1 className="text-[#7290A9] text-2xl sm:text-center sm:text-5xl">
            Created by locals for tourists
          </h1>
        </div>
      </div>

      {/* The Map component which will dynamically fetch and display weather stations */}
      <div className="w-full h-screen bg-[#000009]">
        <Map />
      </div>

      <div className="w-full h-screen bg-[#000009]">
        {/* Placeholder Div */}
        <div className="max-w-[750px] mx-auto px-8 flex flex-col justify-center h-full items-center">
          <h1 className="text-[#7290A9] text-2xl sm:text-center sm:text-5xl">
            Placeholder Div for Data Analysis
          </h1>
        </div>
      </div>
    </main>
  );
}
