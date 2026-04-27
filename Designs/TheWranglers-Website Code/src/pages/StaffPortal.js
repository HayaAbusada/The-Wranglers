import { useState, useEffect } from "react";
import "../App.css";
import { getVolunteerCode } from "../utils/volunteerCode";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";


function StaffPortal() {
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(null);

  const [students, setStudents] = useState([]);
  
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  const [searchStudentName, setSearchStudentName] = useState("");
  const [searchParentName, setSearchParentName] = useState("");
  const [searchPlateNumber, setSearchPlateNumber] = useState("");
  const [filterPlateState, setFilterPlateState] = useState("");

  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showInvalidCredentialsModal, setShowInvalidCredentialsModal] = useState(false);

  // login check
  useEffect(() => {
    const loginCheck = async () => {
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser();

        if (authError || !authData.user) {
          setShowInvalidCredentialsModal(true);
          setIsAuthorized(false);
          setIsAuthChecking(false);
          return;
        }

        const { data: adminData, error: adminError } = await supabase
          .from("admin")
          .select("id")
          .eq("google_id", authData.user.id)
          .single();

        if (adminError || !adminData) {
          setShowInvalidCredentialsModal(true);
          setIsAuthorized(false);
          setIsAuthChecking(false);
          return;
        }

        setIsAuthorized(true);
        await fetchStudentData();
        setIsAuthChecking(false);
      } catch (error) {
        console.error("Login check error:", error);
        setShowInvalidCredentialsModal(true);
        setIsAuthorized(false);
        setIsAuthChecking(false);
      }
    };

    loginCheck();
  }, [navigate]);

  // useEffect(() => {
  //   fetchStudentData();
  // }, [navigate]);
  
  const handleInvalidCredentialsClose = () => {
    setShowInvalidCredentialsModal(false);
    navigate("/");
  };

  // get info from database
  const fetchStudentData = async () => {
    try {
      const { data, error } = await supabase
        .from("parent_student")
        .select(`
          id,
          pickup_status,
          students (
            id,
            student_first_name,
            student_last_name,
            student_grade
          ),
          parent (
            id,
            parent_first_name,
            parent_last_name,
            plate_state,
            plate_number
          )
        `);

      if (error) throw error;

      console.log("Raw Supabase Data:", data);

      if (data) {
        const formattedData = data.map((row) => ({
          id: row.id,
          
          student_id: row.students?.id,
          parent_id: row.parent?.id,
          
          name: `${row.students?.student_first_name || 'N/A'} ${row.students?.student_last_name || ''}`,
          grade: row.students?.student_grade || '',
          parents: `${row.parent?.parent_first_name || 'N/A'} ${row.parent?.parent_last_name || ''}`,
          licensePlate: `${row.parent?.plate_state || ''} ${row.parent?.plate_number || 'No Plate'}`,
          
          student_first_name: row.students?.student_first_name || '',
          student_last_name: row.students?.student_last_name || '',
          student_grade: row.students?.student_grade || '',
          parent_first_name: row.parent?.parent_first_name || '',
          parent_last_name: row.parent?.parent_last_name || '',
          plate_state: row.parent?.plate_state || '',
          plate_number: row.parent?.plate_number || '',
          status: row.pickup_status ? "Approved" : "Pending",
        }));
        
        setStudents(formattedData);
      }
    } catch (error) {
      console.error("Error fetching student data:", error.message);
      alert("Error loading table data. Check the developer console for details.");
    }
  };

  const volunteerCode = getVolunteerCode();

  const handleEdit = (id) => {
    const studentToEdit = students.find((student) => student.id === id);
    if (studentToEdit) {
      setEditFormData(studentToEdit);
      setIsModalOpen(true);
    }
  };

  // edit data
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    
    try {
      const { error: studentError } = await supabase
        .from('students')
        .update({
          student_first_name: editFormData.student_first_name,
          student_last_name: editFormData.student_last_name,
          student_grade: editFormData.student_grade
        })
        .eq('id', editFormData.student_id);
      
      if (studentError) throw studentError;

      const { error: parentError } = await supabase
        .from('parent')
        .update({
          parent_first_name: editFormData.parent_first_name,
          parent_last_name: editFormData.parent_last_name,
          plate_state: editFormData.plate_state,
          plate_number: editFormData.plate_number
        })
        .eq('id', editFormData.parent_id);

      if (parentError) throw parentError;

      const isApproved = editFormData.status === "Approved";
      const { error: statusError } = await supabase
        .from('parent_student')
        .update({ pickup_status: isApproved })
        .eq('id', editFormData.id);

      if (statusError) throw statusError;

      await fetchStudentData();
      setIsModalOpen(false);

    } catch (error) {
      console.error("Error updating records:", error.message);
      alert("Failed to save changes. Please check the console.");
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const handleDelete = async (id) => {
    const recordToDelete = students.find((student) => student.id === id);

    if (!recordToDelete) {
      alert("Record not found.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${recordToDelete.name}?`
    );

    if (!confirmed) return;

    const studentId = recordToDelete.student_id;

    try {
      // delete from parent_student table
      const { error: joinError } = await supabase
        .from('parent_student')
        .delete()
        .eq('id', id);

      if (joinError) throw joinError;

      // delete from students table
      const { error: studentError } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId);

      if (studentError) throw studentError;

      setStudents(students.filter((student) => student.id !== id));

    } catch (error) {
      console.error("Error deleting record:", error.message);
      alert("Failed to delete record: " + error.message);
    }
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // extract unique states for the dropdown filter
  const uniqueStates = [...new Set(students.map(s => s.plate_state).filter(Boolean))].sort();

  // copy of students sorted based on sortConfig and filtered based on search and filter criteria
  const filteredAndSortedStudents = students
    .filter((student) => {
      const matchesStudent = student.name.toLowerCase().includes(searchStudentName.toLowerCase());
      const matchesParent = student.parents.toLowerCase().includes(searchParentName.toLowerCase());
      const matchesPlateNum = student.plate_number.toLowerCase().includes(searchPlateNumber.toLowerCase());
      
      const matchesState = filterPlateState === "" || student.plate_state === filterPlateState;

      return matchesStudent && matchesParent && matchesPlateNum && matchesState;
    })
    .sort((a, b) => {
      if (!sortConfig.key) return 0;

      if (sortConfig.key === 'student_grade') {
        const gradeOrder = { 'KG': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5 };
        const weightA = gradeOrder[a.student_grade] !== undefined ? gradeOrder[a.student_grade] : 99;
        const weightB = gradeOrder[b.student_grade] !== undefined ? gradeOrder[b.student_grade] : 99;

        if (weightA < weightB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (weightA > weightB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      }

      const aValue = a[sortConfig.key]?.toString().toLowerCase() || '';
      const bValue = b[sortConfig.key]?.toString().toLowerCase() || '';

      if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });
  if (isAuthChecking) {
    return null;
  }

  if (!isAuthorized && showInvalidCredentialsModal) {
    return (
      <div className="modal-overlay">
        <div
          className="modal-content"
          style={{ justifyContent:"center", textAlign: "center" }}
        >
          <h2>Not valid credentials</h2>
          <p>Your Google account is not authorized to access this page.</p>
          <div
            className="modal-actions"
            style={{ marginTop: "20px", justifyContent: "center", minWidth: "100%" }}
          >
            <button className="main-btn" onClick={handleInvalidCredentialsClose}>
              OK
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="staff-portal">
      
      {/* Volunteer Code Box */}
      <div className="volunteer-code-box">
        Volunteer Code: <strong>{volunteerCode}</strong>
      </div>

      <h1 className="portal-title">Staff Portal</h1>

      <div className="portal-top-bar">
        <div className="left-buttons">
          <button className="main-btn" onClick={() => navigate("/kids-pickup")}>
            Kids Pickup
          </button>
          <button className="main-btn" onClick={() => navigate("/pickup-station")}>
            Station Screen
          </button>
        </div>

        <button className="main-btn logout-btn" onClick={() => navigate("/")}>
          Logout</button>
      </div>

      {/* search bars */}
      <div style={{ display: "flex", gap: "15px", marginBottom: "20px", flexWrap: "wrap", padding: "0 20px" }}>
        <input
          type="text"
          placeholder="Search Student..."
          value={searchStudentName}
          onChange={(e) => setSearchStudentName(e.target.value)}
          style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ccc", flex: 1, minWidth: "150px" }}
        />
        <input
          type="text"
          placeholder="Search Parent..."
          value={searchParentName}
          onChange={(e) => setSearchParentName(e.target.value)}
          style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ccc", flex: 1, minWidth: "150px" }}
        />
        <div style={{ display: "flex", gap: "5px", flex: 1, minWidth: "200px" }}>
          <select
            value={filterPlateState}
            onChange={(e) => setFilterPlateState(e.target.value)}
            style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ccc", width: "85px" }}
          >
            <option value="">All States</option>
            {uniqueStates.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Search Plate #..."
            value={searchPlateNumber}
            onChange={(e) => setSearchPlateNumber(e.target.value)}
            style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ccc", flex: 1 }}
          />
        </div>
      </div>

        <div className="child-table">
        <table>
          <thead>
            <tr>
              {/* sort when clicked */}
              <th onClick={() => handleSort('student_last_name')} style={{ cursor: "pointer", userSelect: "none" }}>
                Student Name {sortConfig.key === 'student_last_name' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('student_grade')} style={{ cursor: "pointer", userSelect: "none" }}>
                Grade {sortConfig.key === 'student_grade' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('parent_last_name')} style={{ cursor: "pointer", userSelect: "none" }}>
                Parent(s) {sortConfig.key === 'parent_last_name' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('licensePlate')} style={{ cursor: "pointer", userSelect: "none" }}>
                Parent License Plate {sortConfig.key === 'licensePlate' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('status')} style={{ cursor: "pointer", userSelect: "none" }}>
                Status {sortConfig.key === 'status' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* display info */}
            {filteredAndSortedStudents.map((student) => (
              <tr key={student.id}>
                <td>{student.name}</td>
                <td>{student.grade}</td>
                <td>{student.parents}</td>
                <td>{student.licensePlate}</td>
                <td>{student.status}</td>
                <td>
                  <button 
                    className="edit-btn" 
                    onClick={() => handleEdit(student.id)}
                  >
                    ✏
                  </button>
                  <button 
                    className="delete-btn" 
                    onClick={() => handleDelete(student.id)}
                  >
                    ❌
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* edit modal */}
      {isModalOpen && editFormData && (
        <div className="modal-overlay" style={{ overflowY: 'auto', paddingTop: '50px' }}>
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <h2>Edit Record</h2>
            
            <form onSubmit={handleSaveEdit}>
              {/* student section */}
              <h3 style={{ borderBottom: '1px solid #000000', paddingBottom: '5px' }}>Student Info</h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>First Name:</label>
                  <input type="text" name="student_first_name" value={editFormData.student_first_name} onChange={handleFormChange} required />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Last Name:</label>
                  <input type="text" name="student_last_name" value={editFormData.student_last_name} onChange={handleFormChange} required />
                </div>
                
                <div className="form-group" style={{ width: '100px' }}>
                  <label>Grade:</label>
                  <select 
                    name="student_grade" 
                    value={editFormData.student_grade} 
                    onChange={handleFormChange} 
                    required
                  >
                    <option value="" disabled>Select</option>
                    <option value="KG">KG</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                </div>
              </div>
              
              {/* parent section */}
              <h3 style={{ borderBottom: '1px solid #000000', paddingBottom: '5px', marginTop: '20px' }}>Parent Info</h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>First Name:</label>
                  <input type="text" name="parent_first_name" value={editFormData.parent_first_name} onChange={handleFormChange} required />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Last Name:</label>
                  <input type="text" name="parent_last_name" value={editFormData.parent_last_name} onChange={handleFormChange} required />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <div className="form-group" style={{ width: '100px' }}>
                  <label>Plate State:</label>
                  <input type="text" name="plate_state" value={editFormData.plate_state} onChange={handleFormChange} maxLength={2} required />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Plate Number:</label>
                  <input type="text" name="plate_number" value={editFormData.plate_number} onChange={handleFormChange} required />
                </div>
              </div>

              {/* status section */}
              <h3 style={{ borderBottom: '1px solid #000000', paddingBottom: '5px', marginTop: '20px' }}>Approval Status</h3>
              <div className="form-group">
                <select id="status" name="status" value={editFormData.status} onChange={handleFormChange}>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                </select>
              </div>

              <div className="modal-actions" style={{ marginTop: '30px' }}>
                <button type="submit" className="main-btn">Save All Changes</button>
                <button type="button" className="main-btn logout-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showInvalidCredentialsModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "420px", textAlign: "center" }}>
            <h2>Not valid credentials</h2>
            <p>Your Google account is not authorized to access this page.</p>
            <div className="modal-actions" style={{ marginTop: "20px", justifyContent: "center" }}>
              <button className="main-btn" onClick={handleInvalidCredentialsClose}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StaffPortal;