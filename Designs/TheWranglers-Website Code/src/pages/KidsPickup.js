import React, { useEffect, useMemo, useState } from "react";
import "../App.css";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useRef } from "react";



function KidsPickup() {
  const navigate = useNavigate();
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const lastSpokenRef = useRef("");
  const lastIdRef = useRef(null);
  
  
 const speakWORDS = (text) => {
  if (!window.speechSynthesis) return;

  window.speechSynthesis.cancel(); // stop overlap

  const msg = new SpeechSynthesisUtterance(text);
  msg.rate = 1;
  msg.pitch = 1;
  msg.volume = 1;

  window.speechSynthesis.speak(msg);
};




  ///// GLOBAL VARIABLES ///////
  const COLOR_OPTIONS = useMemo(() => [
      "Red", "Orange", "Yellow", "Green", "Blue", "Purple",
      "Pink", "Peach", "Mint", "Teal", "Lavender", "Coral",
      "Sky", "Lime", "Rose",],[]);
  const COLOR_HEX = useMemo(() => ({
      Red: "#e6b3b3",
      Orange: "#f5d1a8",
      Yellow: "#f7e7a9",
      Green: "#cfe3c4",
      Blue: "#c7d7ef",
      Purple: "#d7cde8",
      Pink: "#f6c1d1",
      Peach: "#f8d5c4",
      Mint: "#d6f0e0",
      Teal: "#c9e6e3",
      Lavender: "#e2d9f3",
      Coral: "#f7c6b9",
      Sky: "#d6e9f8",
      Lime: "#e6f4c7",
      Rose: "#f4c7cf",}),[]);

  const [stations, setStations] = useState([]); // Stations availible for use 
  const [loading, setLoading] = useState(true); // if site has loaded
  const [selectedColor, setSelectedColor] = useState(""); // ?????
  const [errorMsg, setErrorMsg] = useState(""); // Error message

  // Getting the stations already in database
  const fetchStations = async () => {
    setLoading(true);
    setErrorMsg("");
    const { data, error } = await supabase
      .from("stations")
      .select("id,color")
      .order("id", { ascending: true });
    //  speakWORDS(data);
    if (error) {
      console.error("Fetch stations error:", error);
      setErrorMsg(error.message);
      setStations([]);
      setLoading(false);
      // speakWORDS(data);
      return;
    }
    setStations(data || []);
    setLoading(false);
  };
  useEffect(() => {
    fetchStations();
  }, []);

  // Station Color Options For adding a station
  const usedColors = useMemo(() => new Set(stations.map((s) => s.color)), [stations]); // prevents user from selecting color already in use
  const availableColors = useMemo(() => COLOR_OPTIONS.filter((c) => !usedColors.has(c)),[COLOR_OPTIONS, usedColors]);

  // adding a station
  const handleAddStation = async () => {
    setErrorMsg("");
    if (!selectedColor) {
      setErrorMsg("Please select a color first.");
      return;
    }
    if (usedColors.has(selectedColor)) {
      setErrorMsg("That color is already used.");
      return;
    }
    const { error } = await supabase
      .from("stations")
      .insert([{ color: selectedColor }]);

    if (error) {
      console.error("Add station error:", error);
      setErrorMsg(error.message);
      return;
    }
    setSelectedColor("");
    fetchStations();
  };

  // Removing a station
  const handleRemoveStation = async (station) => {
    setErrorMsg("");

    // never remove the first station (your Red)
    if (station.id === 1 || station.color === "Red") return;

    const confirmed = window.confirm(
      `Are you sure you want to remove station ${station.color}?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("stations")
      .delete()
      .eq("id", station.id);

    if (error) {
      console.error("Remove station error:", error);
      setErrorMsg(error.message);
      return;
    }

    fetchStations();
  };


  // Getting The Student Data
  const [data, setData] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://wranglers-capstone.onrender.com/data');
        // const response = await fetch('http://localhost:25565/data');
        const result = await response.json();
        setData(result);
        console.log(result);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
    // Refresh
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
  if (!voiceEnabled) return;
  if (!data || data.length === 0) return;

  const lastKid = data.at(-1);
  if (!lastKid) return;

  // prevent duplicates
  // if (lastIdRef.current === lastKid.id) return;

  lastIdRef.current = lastKid.id;

  const station = stations.find(
    (s, i) => i + 1 === lastKid.station
  );

  const color = station?.color || "station";

  const message = `${lastKid.name} go to ${color} station`;

  window.speechSynthesis.cancel();

  const msg = new SpeechSynthesisUtterance(message);
  msg.rate = 0.9;

  window.speechSynthesis.speak(msg);
}, [data, voiceEnabled, stations]);

  return (
    <div className="kids-pickup">
      <h1 className="portal-title">Kids Module Screen</h1>

      <button className="back-btn" onClick={() => navigate(-1)}>
        Back
      </button>

      {/* ✅ Add Station UI (this is what you said you don’t see) */}
      <div className="station-controls">
        <div className="station-controls-left">
          <label className="station-label">Add Station:</label>

          <div className="station-picker">
            <span
              className="station-swatch"
              style={{
                backgroundColor: selectedColor
                  ? COLOR_HEX[selectedColor]
                  : "rgba(255,255,255,0.15)",
              }}
            />
            <select
              className="station-select"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
            >
              <option value="">Select Color...</option>
              {availableColors.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="main-btn station-add-btn"
            onClick={handleAddStation}
            disabled={availableColors.length === 0}
          >
            Add Station
          </button>
        </div>

        {errorMsg && <p className="station-error">{errorMsg}</p>}
      </div>

      <div className="kids-layout">
        <div className="modules-grid">
          {loading ? (
            <p>Loading stations...</p>
          ) : (
            stations.map((station) => {
              const color = station.color || "Red";
              const colorClass = String(color).toLowerCase();
              const selectedIndex = stations.findIndex((s) => s.color === station.color); // index of station
              // console.log("selectINdex:", selectedIndex);
              return (
                <div key={station.id} className={`module-card ${colorClass}`}>
                  <div className="card-content">
                    <div className="station-card-header">
                      <h2>{color}</h2>

                      {station.id !== 1 && color !== "Red" && (
                        <button
                          type="button"
                          className="remove-station"
                          onClick={() => handleRemoveStation(station)}
                          title="Remove station"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <div className="tablescroll">
                      <table className="module-table">
                        <tbody>
                          
                        {
                        data.filter((kid) => kid.station === selectedIndex+1)
                        .map((kid, index) => (
                          <tr key={index}>
                            <td className="row-number">{index + 1}</td>
                            <td className="kid-cell">{kid.name}</td>
                          </tr>))}
                          
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Table Showing the latest called kids (Last one per station) */}
        <div className="up-next">
          <h2>Up NEXT:</h2>
          <table className="up-next-table">
            <tbody>
              {stations.map((station, index) => {
                const color = station.color || "Red"; // get the station color
                const colorClass = String(color).toLowerCase(); // make consistent
                // Get Last Kid in station
                const lastKid = data
                  .filter((kid) => kid.station === index +1)
                  .at(-1);// last kid in the station
                return (
                  <tr key={station.id}>
                    {/* {speakWORDS(lastKid.name + "go to station" + color)} */}
                    <td className={`color-cell ${colorClass}`}>{color}</td>
                    <td className="kid-cell">{lastKid ? lastKid.name : "--" }</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default KidsPickup;