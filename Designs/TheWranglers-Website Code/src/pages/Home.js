import "./../App.css";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useState } from "react";

export default function Home(){
  const navigate = useNavigate();

  // Base URL for OAuth redirect
  const BASE_URL =
    process.env.NODE_ENV === "production"
      ? "https://thewranglers.onrender.com"
      : window.location.origin;

  // Google AUTH ///
  const [parentError, setParentError] = useState("");
  const [staffError, setStaffError] = useState("");
  const [newAccountError, setNewAccountError] = useState("");

  const handleParentLogin = async () => {
    setParentError("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${BASE_URL}/parent-portal`,
      },
    });

    if (error) {
      setParentError("Authentication failed. Please try again.");
    }
  };

  const handleStaffLogin = async () => {
    setStaffError("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${BASE_URL}/staff-portal`,
      },
    });

    if (error) {
      setStaffError("Authentication failed. Please try again.");
    }
  };

  const handleNewAccountLogin = async () => {
    setNewAccountError("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${BASE_URL}/create-account`,
      },
    });

    if (error) {
      setNewAccountError("Authentication failed. Please try again.");
    }
  };
  /////////////////

  return (
    <div className="app">
      <img src="/mascot.png" alt="Mascot" className="mascot-img" />
      <h1 className="title">Pebble Creek Elementary</h1>

      {parentError && <p>{parentError}</p>}
      {staffError && <p>{staffError}</p>}
      {newAccountError && <p>{newAccountError}</p>}

      <div className="button-grid">
        <button className="main-btn" onClick={handleParentLogin}>
          Parent/Guardian Login
        </button>
        <button className="main-btn" onClick={handleStaffLogin}>
          Staff Login
        </button>
      {/* </div>

      <div className="button-row"> */}
        <button className="main-btn" onClick={handleNewAccountLogin}>
          Create New Account
        </button>

        <button
          className="main-btn"
          onClick={() => navigate("/volunteer-login")}
        >
          Volunteer Login
        </button>
      </div>
    </div>
  );
}