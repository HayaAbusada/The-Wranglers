import React from "react";
import "./App.css";
import {Routes,Route} from  "react-router-dom"
import ParentPortal from "./pages/ParentPortal";
import StaffPortal from "./pages/StaffPortal";
import KidsPickup from "./pages/KidsPickup";
import PickupStation from "./pages/PickupStation";
import Home from "./pages/Home"
import CreateAccount from "./pages/CreateAccount";
import VolunteerLogin from "./pages/VolunteerLogin";
import Display from "./pages/Display";


function App() {
  // Database check
  
  
  return ( <>
      {/* Moved login page code to Home.js so that Routes would work correctly */}
      {/* ROUTES */}
      <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/parent-portal" element={<ParentPortal/>}/>
      <Route path="/staff-portal" element={<StaffPortal/>}/>
      <Route path="/kids-pickup" element={<KidsPickup />} />
      <Route path="/pickup-station" element={<PickupStation />} />
      <Route path="/create-account" element={<CreateAccount />} />
      <Route path="/volunteer-login" element={<VolunteerLogin />} />
      <Route path="/display" element={<Display />} />
      </Routes>
    </>
    
  );
}

export default App;


