import React, { useRef, useEffect, useState } from 'react';
import useResizeObserver from '../components/useResizeObserver';
import './Map.scss';
import * as d3 from 'd3';
import { WeatherStation } from '../components/weatherdata'; // Import types and data

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

  // Initialize states for day, month, and year
  const [selectedDay, setSelectedDay] = useState<string>('31');
  const [selectedMonth, setSelectedMonth] = useState<string>('07');
  const [selectedYear, setSelectedYear] = useState<string>('2022');
  const [clickedStation, setClickedStation] = useState<WeatherStation | null>(null); // State to track clicked station
  const [isZoomEnabled, setIsZoomEnabled] = useState(false); // State to control zoom activation

  // Combine selected day, month, and year into a single date string (dd-mm-yyyy)
  const selectedDate = `${selectedDay}-${selectedMonth}-${selectedYear}`;

  // Helper arrays for days, months, and years
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0')); // 01 to 31
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')); // 01 to 12
  const years = ['2022', '2023', '2024']; // Fixed range of years

  // Filter data based on selected date
  const filteredStations = stations.map(station => {
    const weatherForDate = station.data.find(d => d.date === selectedDate);
    return {
      ...station,
      ...(weatherForDate || {
        rain: 0,
        max_temperature: 0,
        min_temperature: 0,
        tourist_spot: ""
      })
    };
  });

  // Function to get the last 3 days of data for a station based on selected date
  const getLast3DaysData = (station: WeatherStation) => {
    const todayIndex = station.data.findIndex(d => d.date === selectedDate);
    if (todayIndex === -1) return [];

    // Get up to 3 days of previous data (including today if available)
    const startIndex = Math.max(0, todayIndex - 3); // Ensure we don't go out of bounds (adjusted to -2 for 3 days)
    return station.data.slice(startIndex, todayIndex).reverse(); // Get last 3 days and reverse to show most recent first
  };

  // Function to determine radius based on rainfall
  const getRadiusBasedOnRainfall = (rain: number): number => {
    if (rain < 5) return 2; // Increased radius for better visibility
    if (rain >= 5 && rain <= 16) return 3; // Medium dot for 10-15mm rainfall
    if (rain > 17 && rain <= 30) return 4; // Larger dot for 16-20mm rainfall
    return 5; // Biggest dot for rainfall above 20mm
  };

  // Function to determine the fill color based on max_temperature
  const getColorBasedOnTemperature = (max_temperature: number): string => {
    if (max_temperature > 31) return '#e74c3c'; // Above 31°C - Red
    if (max_temperature >= 21 && max_temperature <= 30) return '#f39c12'; // 21-30°C - Orange
    if (max_temperature >= 10 && max_temperature <= 20) return '#1abc9c'; // 10-20°C - Green
    return '#3498db'; // Below 10°C - Blue
  };

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

    // Function to handle zoom event
    const zoomed = (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
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

    if (isZoomEnabled) {
      map.call(zoom); // Enable zoom only if within boundaries
    }

    map.on('mousemove', function (event) {
      const [mouseX, mouseY] = d3.pointer(event);
      const isInMap = mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;
      setIsZoomEnabled(isInMap);
    });

    map
      .selectAll('.district')
      .data(data.features)
      .join('path')
      .attr('class', 'district')
      .attr('district', (district: any) => district.properties.SvcDistr)
      .attr('d', (d: any) => pathGenerator(d));

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
        return NaN;
      })
      .attr('cy', d => {
        if (d.longitude !== undefined && d.latitude !== undefined) {
          const [x, y] = projection([d.longitude, d.latitude]) || [NaN, NaN];
          return y;
        }
        return NaN;
      })
      .attr('r', d => getRadiusBasedOnRainfall(d.rain)) // Set radius based on rainfall
      .attr('fill', d => getColorBasedOnTemperature(d.max_temperature)) // Set color based on temperature
      .style('cursor', 'pointer') // Change cursor style on hover
      .on('click', function (event, d) {
        event.stopPropagation(); // Stop event propagation to prevent unintended behavior
        console.log(`Station clicked: ${d.name}`); // Log the clicked station for debugging

        // Get the last 3 days of data for the clicked station
        const last3Days = getLast3DaysData(d);

        // Create expanded tooltip content with last 3 days data
        const last3DaysContent = last3Days.map(data => `
          <div class="tooltip-content">
            <strong>Date: ${data.date}</strong><br/>
            <span>Rainfall: ${data.rain} mm</span><br/>
            <span>Max Temp: ${data.max_temperature}°C</span><br/>
            <span>Min Temp: ${data.min_temperature}°C</span>
          </div>
        `).join('');

        const expandedTooltipContent = `
          <div class="tooltip-content">
            <strong>${d.name}</strong><br/>
            <span>Rainfall: ${d.rain} mm | Max Temp: ${d.max_temperature}°C | Min Temp: ${d.min_temperature}°C</span><br/>
            <h3>Last 3 Days of Data:</h3>
            ${last3DaysContent}
          </div>
        `;

        // Show the expanded tooltip and position it correctly
        tooltip
          .style('left', (event.pageX + 20) + 'px') // Offset tooltip position from cursor
          .style('top', (event.pageY - 15) + 'px')
          .classed('hidden', false) // Make the tooltip visible
          .html(expandedTooltipContent);
      })
      .on('mouseover', function (event, d) {
        if (!clickedStation) { // Show tooltip on hover only if no station is clicked
          const tooltipContent = `
            <strong>${d.name}</strong><br/>
            Rainfall: ${d.rain} mm<br/>
            Max Temperature: ${d.max_temperature}°C<br/>
            Min Temperature: ${d.min_temperature}°C<br/>
            Tourist Spots: ${d.tourist_spot}<br/>
          `;

          tooltip
            .style('left', (event.pageX + 20) + 'px') // Offset tooltip position from cursor
            .style('top', (event.pageY - 15) + 'px')
            .classed('hidden', false) // Make the tooltip visible
            .html(tooltipContent);
        }
      })
      .on('mouseleave', function () {
        if (!clickedStation) { // Only hide tooltip if no station is clicked
          tooltip.classed('hidden', true); // Hide the tooltip
        }
      });

  }, [dimensions, data, filteredStations, isZoomEnabled, clickedStation]);

  return (
    <section>
      <h1 className="mx-auto px-8 flex flex-col justify-center h-full items-center mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">{title}</h1>

      {/* Date Selection Dropdowns */}
      <div className="date-selection">
        <label htmlFor="day-select">Day: </label>
        <select id="day-select" value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)}>
          {days.map(day => (
            <option key={day} value={day}>{day}</option>
          ))}
        </select>

        <label htmlFor="month-select">Month: </label>
        <select id="month-select" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
          {months.map(month => (
            <option key={month} value={month}>{month}</option>
          ))}
        </select>

        <label htmlFor="year-select">Year: </label>
        <select id="year-select" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
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
