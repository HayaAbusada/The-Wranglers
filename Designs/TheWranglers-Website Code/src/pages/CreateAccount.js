import "../App.css";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useState, useEffect} from "react";

function CreateAccount() {
  const navigate = useNavigate();
  const [googleid, setGoogleid]=useState(null);
  const [plateError, setPlateError] = useState("");

  const [parent, setParent] = useState({
    firstName: "",
    lastName: "",
    plateNumber: "",
    plateState: "",
    email: "",
  });

  const [students, setStudents] = useState([
    { firstName: "", middleName: "", lastName: "", grade: "" },
  ]);


  const addStudent = () => {
    setStudents([
      ...students,
      { firstName: "", middleName: "", lastName: "", grade: "" },
    ]);
  };

  const removeStudent = (index) => {
    setStudents(students.filter((_, i) => i !== index));
  };

  const handleParentChange = (e) => {
    const { name, value } = e.target;

    if (name === "plateNumber") {
      const cleaned = value.toUpperCase().replace(/\s/g, "");

      if (cleaned.length > 7) {
        setPlateError("License plate must be 7 characters or less");
      } else {
        setPlateError("");
        setParent({ ...parent, [name]: cleaned });
      }

      return;
    }

    setParent({ ...parent, [name]: value });
  };

  const handleStudentChange = (index, e) => {
    const updated = [...students];
    updated[index][e.target.name] = e.target.value;
    setStudents(updated);
  };

  // getting google id
  
useEffect(() => {
  const checkUser = async () => {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (!authData.user) {
            navigate("/");
        }
        if(authError){
            console.log(authError);
            return;
        }
        setGoogleid(authData.user.id);
  }
  checkUser();
    }, [navigate]);

  


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (parent.plateNumber.length > 7) {
      setPlateError("License plate must be 7 characters or less");
      return;
    }


    try {
      const now = new Date();
      const year = now.getFullYear();

      // JS months are 0-based: Jan=0 ... Jun=5 ... Jul=6
      const expiresYear = now.getMonth() <= 5 ? year : year + 1;

      // "YYYY-06-30" works great for Postgres date columns
      const accountExpiration = `${expiresYear}-06-30`;

      //Insert parent
      const parentPayload = {
        parent_first_name: parent.firstName,
        parent_last_name: parent.lastName,
        plate_number: parent.plateNumber,
        plate_state: parent.plateState,
        email: parent.email,
        google_id: googleid,
        account_expiration: accountExpiration,
      };

      const { data: parentData, error: parentError } = await supabase
        .from("parent")
        .insert([parentPayload])
        .select()
        .single();

      if (parentError) {
        console.error("Parent insert error:", parentError);
        alert(parentError.message);
        return;
      }

      //Insert students
      const studentPayload = students.map((s) => ({
        student_first_name: s.firstName,
        student_middle_name: s.middleName,
        student_last_name: s.lastName,
        student_grade: s.grade,
      }));

      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .insert(studentPayload)
        .select();

      if (studentError) {
        console.error("Student insert error:", studentError);
        alert(studentError.message);
        return;
      }

      // Link parent & students in parent_student (int8 ids)
      const links = (studentData || []).map((stu) => ({
        parent_id: parentData.id, 
        student_id: stu.id,       
        pickup_status: false,
      }));

      const { error: linkError } = await supabase
        .from("parent_student")
        .insert(links);

      if (linkError) {
        console.error("Link error:", linkError);
        alert(linkError.message);
        return;
      }

      // Success
      navigate("/parent-portal");
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("Unexpected error occurred.");
    }
  };

  const isParentValid =
  parent.firstName.trim() !== "" &&
  parent.lastName.trim() !== "" &&
  parent.plateNumber.trim() !== "" &&
  parent.plateNumber.trim().length <= 7 &&
  parent.plateState.trim() !== "" &&
  parent.email.trim() !== "";

  const areStudentsValid = students.every(
    (student) =>
      student.firstName.trim() !== "" &&
      student.lastName.trim() !== "" &&
      student.grade.trim() !== ""
  );

  const isFormValid = isParentValid && areStudentsValid && !plateError;

  return (
    <div className="create-account">
      <button className="back-btn" onClick={() => navigate(-1)}>
        Back
      </button>

      <h1>Account Creation</h1>

      <div className="form-container">
        {/* Parent Info */}
        <div className="form-column">
          <h2>Parent Information</h2>

          <label>Parent First Name *</label>
          <input
            name="firstName"
            placeholder="First Name..."
            onChange={handleParentChange}
            required
          />

          <label>Parent Last Name *</label>
          <input
            name="lastName"
            placeholder="Last Name..."
            onChange={handleParentChange}
            required
          />

          <label>License Plate Number *</label>
          <input
            name="plateNumber"
            placeholder="Plate Number..."
            value={parent.plateNumber}
            onChange={handleParentChange}
            required
          />

          {plateError && (
            <p style={{ color: "red", marginTop: "5px" }}>
              {plateError}
            </p>
          )}

          <label>License Plate State *</label>
          <select name="plateState" className="select_text" onChange={handleParentChange} required>
            <option value="">Select State...</option>
            <option value="AL">Alabama</option>
            <option value="AK">Alaska</option>
            <option value="AZ">Arizona</option>
            <option value="AR">Arkansas</option>
            <option value="CA">California</option>
            <option value="CO">Colorado</option>
            <option value="CT">Connecticut</option>
            <option value="DE">Delaware</option>
            <option value="FL">Florida</option>
            <option value="GA">Georgia</option>
            <option value="HI">Hawaii</option>
            <option value="ID">Idaho</option>
            <option value="IL">Illinois</option>
            <option value="IN">Indiana</option>
            <option value="IA">Iowa</option>
            <option value="KS">Kansas</option>
            <option value="KY">Kentucky</option>
            <option value="LA">Louisiana</option>
            <option value="ME">Maine</option>
            <option value="MD">Maryland</option>
            <option value="MA">Massachusetts</option>
            <option value="MI">Michigan</option>
            <option value="MN">Minnesota</option>
            <option value="MS">Mississippi</option>
            <option value="MO">Missouri</option>
            <option value="MT">Montana</option>
            <option value="NE">Nebraska</option>
            <option value="NV">Nevada</option>
            <option value="NH">New Hampshire</option>
            <option value="NJ">New Jersey</option>
            <option value="NM">New Mexico</option>
            <option value="NY">New York</option>
            <option value="NC">North Carolina</option>
            <option value="ND">North Dakota</option>
            <option value="OH">Ohio</option>
            <option value="OK">Oklahoma</option>
            <option value="OR">Oregon</option>
            <option value="PA">Pennsylvania</option>
            <option value="RI">Rhode Island</option>
            <option value="SC">South Carolina</option>
            <option value="SD">South Dakota</option>
            <option value="TN">Tennessee</option>
            <option value="TX">Texas</option>
            <option value="UT">Utah</option>
            <option value="VT">Vermont</option>
            <option value="VA">Virginia</option>
            <option value="WA">Washington</option>
            <option value="WV">West Virginia</option>
            <option value="WI">Wisconsin</option>
            <option value="WY">Wyoming</option>
          </select>

          <label>Email (Gmail) *</label>
          <input
            name="email"
            type="email"
            placeholder="...@gmail.com"
            onChange={handleParentChange}
            required
          />
        </div>

        {/* Student Info */}
        <div className="form-column">
          <h2>Student Information</h2>

          {students.map((student, index) => (
            <div key={index} className="student-block">
              <div className="student-header">
                <h3>Student {index + 1}</h3>
                {index !== 0 && (
                  <button
                    type="button"
                    className="remove-student"
                    onClick={() => removeStudent(index)}
                  >
                    ✕
                  </button>
                )}
              </div>

              <label>Student First Name *</label>
              <input
                name="firstName"
                placeholder="First Name..."
                onChange={(e) => handleStudentChange(index, e)}
                required
              />

              <label>Student Middle Name</label>
              <input
                name="middleName"
                placeholder="Middle Name..."
                onChange={(e) => handleStudentChange(index, e)}
              />

              <label>Student Last Name *</label>
              <input
                name="lastName"
                placeholder="Last Name..."
                onChange={(e) => handleStudentChange(index, e)}
                required
              />

              <label>Student Grade *</label>
              <select
                name="grade"
                onChange={(e) => handleStudentChange(index, e)}
                className="select_text" 
                required
              >
                <option value="">Select Grade...</option>
                <option value="KG">Kindergarten</option>
                <option value="1">1st</option>
                <option value="2">2nd</option>
                <option value="3">3rd</option>
                <option value="4">4th</option>
                <option value="5">5th</option>
              </select>
            </div>
          ))}

          <button type="button" className="add-student" onClick={addStudent}>
            Add Another Student
          </button>
        </div>
      </div>

      <button
        className="submit-btn"
        onClick={handleSubmit}
        disabled={!isFormValid}
      >
        Submit to School
      </button>
    </div>
  );
}

export default CreateAccount;