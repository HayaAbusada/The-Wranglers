import "../App.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function PickupStation() {
  const navigate = useNavigate();
  const API_BASE = "https://wranglers-capstone.onrender.com"
  //const API_BASE = "http://localhost:25565";

  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [data, setData] = useState([]);

  const fetchStations = async () => {
    setLoading(true);
    setErrorMsg("");

    const { data, error } = await supabase
      .from("stations")
      .select("id,color")
      .order("id", { ascending: true });

    if (error) {
      console.error("Fetch stations error:", error);
      setErrorMsg(error.message);
      setStations([]);
      setLoading(false);
      return;
    }

    const list = data || [];
    setStations(list);

    if (list.length > 0) {
      setSelectedStation((prev) => prev ?? list[0]);
    }

    setLoading(false);
  };
  useEffect(() => {
    fetchStations();
  }, []);

  // const fetchData = async () => {
  //   try {
  //     const response = await fetch(`${API_BASE}/data`);
  //     const result = await response.json();

  //     if (!response.ok) {
  //       throw new Error(result.error || "Failed to fetch data");
  //     }

  //     setData(result);
  //     console.log("Fetched data:", result);
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //   }
  // };

  // useEffect(() => {
  //   fetchStations();
  //   fetchData();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await fetch(`${API_BASE}/data`);
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

  

  const handlePickup = async (kidToRemove) => {
    try {
      const response = await fetch(`${API_BASE}/data`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: kidToRemove.name,
          parent: kidToRemove.parent,
          station: kidToRemove.station,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to remove kid");
      }

      setData((prev) => {
        const index = prev.findIndex(
          (kid) =>
            kid.name === kidToRemove.name &&
            kid.parent === kidToRemove.parent &&
            kid.station === kidToRemove.station
        );

        if (index === -1) return prev;

        const updated = [...prev];
        updated.splice(index, 1);
        return updated;
      });

      console.log("Picked up:", result.removed);
    } catch (error) {
      console.error("Pickup error:", error);
    }
  };

  const selectedColor = selectedStation?.color || "";
  const selectedIndex = stations.findIndex((s) => s.color === selectedColor);
  const filteredKids =
    selectedIndex === -1
      ? []
      : data.filter((kid) => kid.station === selectedIndex + 1);

  return (
    <div className="pickup-station">
      <h1 className="portal-title">Pickup Station</h1>

      <button className="back-btn" onClick={() => navigate(-1)}>
        Back
      </button>

      

      <div className="dropdown-container">
        <label htmlFor="color-select">Select Color:</label>

        <select
          id="color-select"
          className="dropdown"
          value={selectedStation?.id ?? ""}
          onChange={(e) => {
            const id = Number(e.target.value);
            const found = stations.find((s) => s.id === id);
            setSelectedStation(found || null);
          }}
          disabled={loading || stations.length === 0}
        >
          {loading && <option value="">Loading...</option>}
          {!loading && stations.length === 0 && (
            <option value="">No stations found</option>
          )}
          {!loading &&
            stations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.color}
              </option>
            ))}
        </select>
      </div>

      {errorMsg && <p className="station-error">{errorMsg}</p>}

      <div className="kids-layout">
        <div className="modules-grid">
          {selectedColor ? (
            <div className={`module-card ${selectedColor.toLowerCase()}`}>
              <div className="card-content">
                <h2>{selectedColor}</h2>

                <div className="table-scroll">
                  <table className="module-table">
                    <tbody>
                      {filteredKids.length === 0 ? (
                        <tr>
                          <td colSpan="3" style={{ textAlign: "center" }}>
                            No kids currently
                          </td>
                        </tr>
                      ) : (
                        filteredKids.map((kid, index) => (
                          <tr key={`${kid.name}-${kid.parent}-${kid.station}-${index}`}>
                            <td className="row-number">{index + 1}</td>
                            <td className="kid-cell">{kid.name}</td>
                            <td style={{ width: 60, textAlign: "center" }}>
                              <button
                                className="pickup-btn"
                                onClick={() => handlePickup(kid)}
                              >
                                ✅
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <p style={{ color: "white" }}>Select a station to view kids.</p>
          )}
        </div>
      </div>
    </div>
  );
}