/* eslint-disable react/prop-types */
import React, { useRef, useEffect } from "react";
import useResizeObserver from "../components/useResizeObserver";
import "./Map.scss";
import * as d3 from "d3";

type MapProps = {
  title: string;
  data: any; // Replace `any` with a specific type matching your GeoJSON structure if possible
};

export default function CustomMap({ title, data }: MapProps) {  // Renamed from Map to CustomMap
  const mapRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const legendRef = useRef<HTMLUListElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dimensions = useResizeObserver(wrapperRef);

  useEffect(() => {
    if (!mapRef.current) return; // Ensure mapRef.current is not null before proceeding

    const map = d3.select<SVGSVGElement, unknown>(mapRef.current);
    d3.selectAll(".tooltip").remove();
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip hidden");

    const { width, height } =
      dimensions || wrapperRef.current!.getBoundingClientRect();

    const projection = d3
      .geoMercator()
      .fitSize([width, height], data)
      .precision(100);

    const pathGenerator = d3.geoPath().projection(projection);


    const zoomed = (event: any) => {
      map.selectAll("path").attr("transform", event.transform);
    };

    const zoom: d3.ZoomBehavior<SVGSVGElement, unknown> = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 40])
      .translateExtent([
        [0, 0],
        [width, height],
      ])
      .extent([
        [0, 0],
        [width, height],
      ])
      .on("zoom", zoomed);

    map
      .selectAll(".district")
      .data(data.features)
      .join("path")
      .on("click", (_, el: any) => {
        onClickDistrict(el.properties.SvcDistr);
      })
      .on("mouseover", () => {})
      .on("mouseout", function () {
        tooltip.classed("hidden", true);
      })
      .attr("class", (district: any) => `district`)
      .attr("district", (district: any) => district.properties.SvcDistr)
      // .style("fill", (el: any) => colorScale(el.properties.AREA_SQKM))
      .attr("d", (feature: any) => pathGenerator(feature));

    map.call(zoom);

  }, [dimensions]);

  return (
    <section>
      <h1 className="mx-auto px-8 flex flex-col justify-center h-full items-center mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">{title}</h1>
      <div ref={wrapperRef} className="map">
        <div className="d3-map">
          <svg ref={mapRef} className="svg-map" />
          <div ref={tooltipRef} className="tooltip hidden"></div>
        </div>
      </div>
    </section>
  );
}

function onClickDistrict(district: string) {
  console.log("Clicked district:", district);
}