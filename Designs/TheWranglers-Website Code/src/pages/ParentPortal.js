import "../App.css" // styling
import { useState, useEffect } from "react"; 
import { useNavigate } from "react-router-dom"; // switch pages
import NewChild from "../components/NewChild"; // adding a new child to parent account
import PlateUpdate from "../components/PlateUpdate"; // updating licence plate for parent
import QRcode from "../components/QRcode"; // QR code generator for designated parent
import { supabase } from "../supabaseClient"; // Database
import Header from "../components/header"; // Login/logout button
import Loading from "../components/loading"; // Spinning Loading Wheel
/**
 * Parent Portal Page
 * @returns Parent Portal Page (http://localhost:3000/parent-portal#)
 */
export default function ParentPortal(){
    const navigate = useNavigate();

    // buttons to pop up/hide different components on the side
    const [lpClicked, setIslpClicked] = useState(false); // License Plate Button
    const [newStudentClicked, setNewStudentClicked] = useState(false); // Add Student Button
    const [qrClicked, setQrClicked] = useState(false); // QR Button
    const [accountExpiration, setAccountExpiration] = useState(null); // Account expireation logic
    // Table Info
    const [loading, setLoading]= useState(true); // Don't display table while getting data
    const [parentName, setParentName] = useState();
    const [studentInfo, setStudentInfo] =useState(null);
    const [parent_id, setParent_id]=useState(null); // sent to other components so know which parent child is attached to

    const [noAccountFound, setNoAccountFound] = useState(false);
    
    


    // Login Protection:
    useEffect(() => {
        const checkUser = async () => {
            setLoading(true);
            setNoAccountFound(false);

            const { data: authData, error: authError } = await supabase.auth.getUser();

            if (authError || !authData.user) {
                navigate("/");
                return;
            }

            const { data: parentData, error: parentError } = await supabase
                .from("parent")
                .select("id,parent_first_name,parent_last_name,plate_number,plate_state,account_expiration")
                .eq("google_id", authData.user.id)
                .maybeSingle();

            if (parentError) {
                console.error(parentError);
                setLoading(false);
                return;
            }

            if (!parentData) {
                setNoAccountFound(true);
                setLoading(false);
                return;
            }

            setParentName(parentData.parent_first_name + " " + parentData.parent_last_name);
            setParent_id(parentData.id);
            setAccountExpiration(parentData.account_expiration);

            const { data: studentData, error: studentError } = await supabase
                .from("parent_student")
                .select("parent_id,student_id,pickup_status, students(student_first_name,student_middle_name,student_last_name,student_grade), parent(plate_number,plate_state)")
                .eq("parent_id", parentData.id);

            if (studentError) {
                console.error(studentError);
            } else {
                setStudentInfo(studentData);
            }

            setLoading(false);
        };

        checkUser();
    }, [navigate]);

    const hasApprovedPickup = studentInfo?.some((student) => student.pickup_status);
    const refreshParentPortal = async () => {
        setLoading(true);

        const { data: authData, error: authError } = await supabase.auth.getUser();

        if (authError || !authData.user) {
            setLoading(false);
            navigate("/");
            return;
        }

        const { data: parentData, error: parentError } = await supabase
            .from("parent")
            .select("id,parent_first_name,parent_last_name,plate_number,plate_state,account_expiration")
            .eq("google_id", authData.user.id)
            .maybeSingle();

        if (parentError) {
            console.error(parentError);
            setLoading(false);
            return;
        }

        if (!parentData) {
            setNoAccountFound(true);
            setLoading(false);
            return;
        }

        setParentName(parentData.parent_first_name + " " + parentData.parent_last_name);
        setParent_id(parentData.id);
        setAccountExpiration(parentData.account_expiration);

        const { data: studentData, error: studentError } = await supabase
            .from("parent_student")
            .select("parent_id,student_id,pickup_status, students(student_first_name,student_middle_name,student_last_name,student_grade), parent(plate_number,plate_state)")
            .eq("parent_id", parentData.id);

        if (studentError) {
            console.error(studentError);
        } else {
            setStudentInfo(studentData);
        }

        setLoading(false);
    };

    return (
        <div className="parent-portal">
            <Header />

            {loading ? (
                <Loading />
            ) : noAccountFound ? (
                <div className="no-account-box">
                    <h1>No account found</h1>
                    <p>We could not find a parent account linked to this Google email.</p>
                    <button
                        className="main-btn"
                        onClick={() => navigate("/create-account")}
                    >
                        Create Account
                    </button>
                </div>
            ) : (
                <>
                    <div className="parent-header-row">
                        <h1 className="parent-title">{parentName}'s Students:</h1>
                        <div className="expire-box">
                            <span className="expire-label">Account expires</span>
                            <span className="expire-date">
                                {accountExpiration ? new Date(accountExpiration).toLocaleDateString() : "—"}
                            </span>
                        </div>
                    </div>

                    <div className="button-rows">
                        <button className="main-btn" onClick={() => {setIslpClicked(!lpClicked); setNewStudentClicked(false); setQrClicked(false);}}>
                            Update License Plate
                        </button>
                        <button className="main-btn" onClick={() => {setNewStudentClicked(!newStudentClicked); setIslpClicked(false); setQrClicked(false);}}>
                            Add a New Child
                        </button>
                        <button className="main-btn" onClick={() => {setQrClicked(!qrClicked); setIslpClicked(false); setNewStudentClicked(false);}}>
                            Get QR Code
                        </button>
                    </div>

                    <div className="parent-row">
                        <div className="sidebar">
                            {lpClicked === true && (
                            <PlateUpdate
                                parent_id={parent_id}
                                onPlateUpdated={refreshParentPortal}
                            />
                            )}
                            {newStudentClicked === true && <NewChild parent_id={parent_id} />}
                            {qrClicked === true && (
                                hasApprovedPickup && studentInfo?.[0]?.parent ? (
                                    <QRcode
                                        licensePlate={
                                            studentInfo[0].parent.plate_number +
                                            studentInfo[0].parent.plate_state
                                        }
                                    />
                                ) : (
                                    <div className="pending-approval-message">
                                        <h3>Pickup status pending approval</h3>
                                        <p>Your QR code will be available once pickup status is approved.</p>
                                    </div>
                                )
                            )}
                        </div>

                        <div className="mainSection">
                            <h2>My Students:</h2>

                            {studentInfo && studentInfo.length === 0 ? (
                                <p>No Students yet, please add them by clicking the add student button!</p>
                            ) : (
                                <div className="table-container">
                                    <table className="parent-table">
                                        <thead>
                                            <tr>
                                                <th>Student Name</th>
                                                <th>Student Grade</th>
                                                <th>Pickup Status</th>
                                                <th>Approved Plate</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {studentInfo?.map((student) => (
                                                <tr key={student.student_id}>
                                                    <td>
                                                        {student.students.student_first_name + " " +
                                                        student.students.student_middle_name + " " +
                                                        student.students.student_last_name}
                                                    </td>
                                                    <td>{student.students.student_grade}</td>
                                                    <td>{student.pickup_status ? "Approved" : "Pending Approval"}</td>
                                                    <td>{student.parent.plate_state + " " + student.parent.plate_number}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}