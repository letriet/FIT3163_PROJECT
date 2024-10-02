import { useState, CSSProperties }from 'react';

const WeatherUI: React.FC = () => {
  const [rainfall, setRainfall] = useState<string>('');
  const [temperature, setTemperature] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [ranking, setRanking] = useState<any[]>([]); // State to store the ranked results

  const handleRainfallChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRainfall(event.target.value);
  };

  const handleTemperatureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTemperature(event.target.value);
  };

  const handleStateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedState(event.target.value);
  };

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(event.target.value);
  };

  const handleSubmit = async () => {
    // Validate that all fields are filled
    if (!rainfall || !temperature || !selectedState || !selectedMonth) {
      setErrorMessage('Please fill in all fields before submitting.');
      return;
    }

    // Clear error message
    setErrorMessage('');

    // Logic for processing the selections can go here
    //console.log('Submitted data:', { rainfall, temperature, selectedState, selectedMonth });
  //}; 
  try {
     
    const queryString = new URLSearchParams({
      rainfall,
      temperature,
      state: selectedState,
      month: selectedMonth,
    }).toString();

    const response = await fetch(`/api/weather/rank-stations?${queryString}`, {
     
    });
    const result = await response.json();


    // Check if the response is okay
    if (response.ok) {
        // Assuming the API returns rankedStations with valid data && result.rankedStations 
        if (Array.isArray(result.rankedStations)) {
          setRanking(result.rankedStations);
        } else {
          setRanking([]); // Set to an empty array if no stations are returned
          setErrorMessage('No stations found based on your preferences.');
        }
      } else {
        setErrorMessage(result.error || 'An error occurred while fetching data.');
      }
    } catch (error) {
      setErrorMessage('Failed to fetch data.');
      setRanking([]); // Reset ranking to an empty array if the fetch fails
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.heading}>Rainfall</h3>
      <div style={styles.radioGroup}>
        <label style={styles.label}>
          <input
            type="radio"
            name="rainfall"
            value="High"
            checked={rainfall === 'High'}
            onChange={handleRainfallChange}
            style={styles.radio}
          />
          High
        </label>
        <label style={styles.label}>
          <input
            type="radio"
            name="rainfall"
            value="Low"
            checked={rainfall === 'Low'}
            onChange={handleRainfallChange}
            style={styles.radio}
          />
          Low
        </label>
      </div>

      <h3 style={styles.heading}>Temperature</h3>
      <div style={styles.radioGroup}>
        <label style={styles.label}>
          <input
            type="radio"
            name="temperature"
            value="High"
            checked={temperature === 'High'}
            onChange={handleTemperatureChange}
            style={styles.radio}
          />
          High
        </label>
        <label style={styles.label}>
          <input
            type="radio"
            name="temperature"
            value="Low"
            checked={temperature === 'Low'}
            onChange={handleTemperatureChange}
            style={styles.radio}
          />
          Low
        </label>
      </div>

      <h3 style={styles.heading}>State</h3>
      <select
        value={selectedState}
        onChange={handleStateChange}
        style={styles.select}
      >
        <option value="">Select a state</option>
        <option value="NSW">New South Wales</option>
        <option value="VIC">Victoria</option>
        <option value="QLD">Queensland</option>
        <option value="SA">South Australia</option>
        <option value="WA">Western Australia</option>
        <option value="TAS">Tasmania</option>
        <option value="ACT">Australian Capital Territory</option>
        <option value="NT">Northern Territory</option>
      </select>

      <h3 style={styles.heading}>Month</h3>
      <select
        value={selectedMonth}
        onChange={handleMonthChange}
        style={styles.select}
      >
        <option value="">Select a month</option>
        <option value="01">January</option>
        <option value="02">February</option>
        <option value="03">March</option>
        <option value="04">April</option>
        <option value="05">May</option>
        <option value="06">June</option>
        <option value="07">July</option>
        <option value="08">August</option>
        <option value="09">September</option>
        <option value="10">October</option>
        <option value="11">November</option>
        <option value="12">December</option>
      </select>

      <button onClick={handleSubmit} style={styles.submitButton}>Enter</button>
      {/* Display error message if any */}
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      {/* Display rankings */}
        <div style={styles.container}>
          <h3 style={styles.heading}>Top 5 Places Based on Your Preferences</h3>
          <ul>
            {ranking.map((rank, index) => (
              <li key={index} style={styles.rankingItem}>
              <h4 style={styles.rankingHeading}>Station: {index + 1}: {rank.stationName}</h4>
              <p style={styles.rankingText}>Tourist Spot: {rank.touristSpot}</p>
              <p style={styles.rankingText}>Average Rainfall: {rank.avgRain.toFixed(2)} mm</p>
              <p style={styles.rankingText}>Average Temperature: {rank.avgTemp.toFixed(2)} °C</p>
            </li>
            ))}
          </ul>
        </div>
    </div>
  );
};


const styles : { [key: string]: CSSProperties }= {
    container: {
      padding: '20px',
      backgroundColor: '#000009',
      borderRadius: '10px',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      width: '100%',
      maxWidth: '600px',
      margin: '20px auto',
    },
    heading: {
      fontSize: '1.5rem',
      marginBottom: '10px',
      //textAlign: 'center', // Center the main heading
    },
    subHeading: {
      fontSize: '1.25rem',
      marginBottom: '10px',
    },
    radioGroup: {
      display: 'flex',
      gap: '20px',
      marginBottom: '20px',
    },
    label: {
      display: 'flex',
      alignItems: 'center',
      fontSize: '1rem',
    },
    radio: {
      marginRight: '8px',
    },
    select: {
      padding: '10px',
      fontSize: '1rem',
      marginBottom: '20px',
      backgroundColor: '#333',
      color: 'white',
      border: '1px solid #555',
      borderRadius: '5px',
      width: '100%',
    },
    selectedOptions: {
      marginTop: '20px',
      padding: '10px',
      backgroundColor: '#1a1a1a',
      borderRadius: '10px',
    },
    text: {
      fontSize: '1rem',
    },
    submitButton: {
      padding: '10px 20px',
      fontSize: '1rem',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      marginTop: '10px',
    },
    error: {
      color: 'red',
      fontSize: '1rem',
      marginTop: '10px',
    },
    rankingContainer: {
      padding: '20px',
      backgroundColor: '#1a1a1a', // Darker background for ranking
      borderRadius: '10px',
      marginTop: '20px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)', // Add shadow for depth
    },
    rankingItem: {
      marginBottom: '15px', // Space between ranking items
      padding: '10px', // Padding for each item
      borderBottom: '1px solid #444', // Bottom border for separation
    },
    rankingHeading: {
      margin: 0, // Remove default margin for headings
      fontSize: '1.25rem', // Heading size for places
    },
    rankingText: {
      margin: '5px 0', // Space above and below each paragraph
    },
    combinedScore: {
      fontWeight: 'bold', // Make combined score bold
    },
  };
  


export default WeatherUI;
