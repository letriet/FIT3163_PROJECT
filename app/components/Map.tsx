import React, { useRef, useEffect, useState } from 'react';
import useResizeObserver from '../components/useResizeObserver';
import './Map.scss';
import * as d3 from 'd3';
import { WeatherStation, WeatherData } from '../components/weatherdata'; // Import types and data

type MapProps = {
  title: string;
  data: any; // Replace `any` with a specific type matching your GeoJSON structure if possible
  stations: WeatherStation[]; // Update to use the imported type
};

export default function CustomMap({ title, data, stations }: MapProps) {
  const mapRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dimensions = useResizeObserver(wrapperRef);

  const allDates = Array.from(new Set(stations.flatMap(station => station.data.map(d => d.date)))); // Get unique dates
  const minDate = new Date(Math.min(...allDates.map(date => new Date(date.split('-').reverse().join('-')).getTime()))); // Convert to Date object and get min timestamp
  const maxDate = new Date(Math.max(...allDates.map(date => new Date(date.split('-').reverse().join('-')).getTime()))); // Convert to Date object and get max timestamp
  
  const [selectedDate, setSelectedDate] = useState<Date>(minDate);
  
  // Convert date to string in dd-mm-yyyy format
  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Filter data based on selected date
  const filteredStations = stations.map(station => {
    const weatherForDate = station.data.find(d => d.date === formatDate(selectedDate));
    return {
      ...station,
      ...(weatherForDate || {
        rain: 0,
        max_temperature: 0,
        min_temperature: 0
      })
    };
  });

  useEffect(() => {
    if (!mapRef.current) return;

    const map = d3.select<SVGSVGElement, unknown>(mapRef.current);
    d3.selectAll('.tooltip').remove();
    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip hidden');

    const { width, height } = dimensions || wrapperRef.current!.getBoundingClientRect();

    const projection = d3
      .geoMercator()
      .fitSize([width, height], data)
      .precision(100);

    const pathGenerator = d3.geoPath().projection(projection);

    const zoomed = (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
      // Apply transform to all paths and circles
      map.selectAll('path').attr('transform', event.transform.toString());
      map.selectAll('circle').attr('transform', event.transform.toString());
    };

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 100])
      .translateExtent([
        [0, 0],
        [width, height],
      ])
      .extent([
        [0, 0],
        [width, height],
      ])
      .on('zoom', zoomed);

    map
      .selectAll('.district')
      .data(data.features)
      .join('path')
      .on('click', (_, el: any) => {
        onClickDistrict(el.properties.SvcDistr);
      })
      .attr('class', 'district')
      .attr('district', (district: any) => district.properties.SvcDistr)
      .attr('d', (d: any) => pathGenerator(d));

    // Plot the weather stations
    map
      .selectAll('.station')
      .data(filteredStations)
      .join('circle')
      .attr('class', 'station')
      .attr('cx', d => {
        if (d.longitude !== undefined && d.latitude !== undefined) {
          const [x, y] = projection([d.longitude, d.latitude]) || [NaN, NaN];
          return x;
        }
        return NaN; // Default or handle undefined case
      })
      .attr('cy', d => {
        if (d.longitude !== undefined && d.latitude !== undefined) {
          const [x, y] = projection([d.longitude, d.latitude]) || [NaN, NaN];
          return y;
        }
        return NaN; // Default or handle undefined case
      })
      .attr('r', 1) // Adjust the radius as needed
      .attr('fill', 'red')
      .on('mouseover', function (event, d) {
        tooltip
          .style('left', event.pageX + 'px')
          .style('top', event.pageY - 28 + 'px')
          .classed('hidden', false)
          .html(`<strong>${d.name}</strong><br/>Rainfall: ${d.rain} mm<br/>Max Temperature: ${d.max_temperature}°C<br/>Min Temperature: ${d.min_temperature}°C`);
      })
      .on('mouseleave', function () {
        tooltip.classed('hidden', true);
      })
      .on('click', (event, d) => {
        onClickStation(d);
      });

    map.call(zoom);
  }, [dimensions, data, filteredStations]);

  // Handle slider change
  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const timestamp = Number(event.target.value);
    setSelectedDate(new Date(timestamp));
  };

  return (
    <section>
      <h1 className="mx-auto px-8 flex flex-col justify-center h-full items-center mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">{title}</h1>

      {/* Date Slider */}
      <div className="date-slider">
        <label htmlFor="date-slider">Select Date: </label>
        <input
          type="range"
          id="date-slider"
          min={minDate.getTime()}
          max={maxDate.getTime()}
          step={24 * 60 * 60 * 1000} // Step by one day
          value={selectedDate.getTime()}
          onChange={handleSliderChange}
        />
        <div>{formatDate(selectedDate)}</div> {/* Display selected date */}
      </div>

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

function onClickStation(station: WeatherStation & Partial<WeatherData>) {
  console.log(`Clicked station: ${station.name}`);
  console.log(`Rainfall: ${station.rain} mm`);
  console.log(`Max Temperature: ${station.max_temperature}°C`);
  console.log(`Min Temperature: ${station.min_temperature}°C`);
}