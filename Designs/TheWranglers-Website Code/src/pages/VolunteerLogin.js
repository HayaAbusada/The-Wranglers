import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getVolunteerCode } from "../utils/volunteerCode";
import "../App.css";

function VolunteerLogin() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const validCode = getVolunteerCode(); 

    if (code === String(validCode)) {
      navigate("/pickup-station");
    } else {
      setError("Invalid code. Please try again.");
      setCode("");
    }
  };

  return (
    <div className="volunteer-login">
      <div className="login-card">
        <button className="back-btn" onClick={() => navigate(-1)}>
            Return
        </button>
        <h2>Volunteer Login</h2>
        <p>Please enter today’s volunteer code to access the pickup station.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            maxLength="6"
            placeholder="Enter 6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="main-btn">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default VolunteerLogin;