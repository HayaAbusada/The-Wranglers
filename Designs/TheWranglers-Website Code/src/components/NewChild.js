import "../App.css" // CSS
import { supabase } from "../supabaseClient"; // Database Access
import { useState } from "react"; 

const GRADES= [{name:"Kindergarden", abr: "KG"},
                    {name:"1st", abr: "1"}, 
                    {name:"2nd", abr: "2"}, 
                    {name:"3rd", abr: "3"}, 
                    {name:"4th", abr: "4"}, 
                    {name:"5th", abr: "5"}, ];
/**
 * New Child Component
 * @param {parent_id} Id of the parent who submitted the request
 * @returns New Child Screen
 */
export default function NewChild({parent_id}){
    const [student_first_name, setStudentFirstName]= useState("");
    const [student_middle_name, setStudentMiddleName]= useState("");
    const [student_last_name, setStudentLastName]= useState("");
    const [student_grade, setStudentGrade]= useState("");
    const pickup_status=false;
    const parentId={parent_id};

    // Submit information to the database 
    const handleSubmit= async (e) =>{
        e.preventDefault();
        const data = {
                student_first_name: student_first_name,
                student_middle_name: student_middle_name,
                student_last_name: student_last_name,
                student_grade: student_grade,
            };
            try {
            // add student
            const {data: result, studentError} = await supabase 
                .from("students")
                .insert([data])
                .select("*");
            if(studentError){
                console.error("student info failed to submit: ", studentError);
                alert("student info failed to submit.")
            }
            const stud_id= result[0].id; // set student id so can use for join table
           // insert into join table
           const joinData = {
                    student_id: stud_id,
                    parent_id: parentId.parent_id,
                    pickup_status: pickup_status
                };
            const { error2} = await supabase 
                .from("parent_student")
                .insert([joinData])
                .select("*");
            if(error2){
                console.error("student info failed to submit: ", error2);
                alert("student info failed to submit.")
            }
            else{
                alert("Student info submitted successfully!");
            }
            } catch (error) {
            console.error("Error:", error);
            alert("Failed to submit student info.");
            }
    };


    return( 
    <>
        <h2>New Child Information</h2>
        {/* Form to Fillout to add a student */}
        <form className="mini-form-container" onSubmit={handleSubmit}>
            <div class="form-column">
                {/* First Name */}
                <label for="student_first_name">Student First Name:</label>
                <input type="text" id="student_first_name" name="student_first_name" onChange={(e)=>setStudentFirstName(e.target.value)}/>
                {/* Middle Name */}
                <label for="student_middle_name">Student Middle Name:</label>
                <input type="text" id="student_middle_name" name="student_middle_name" onChange={(e)=>setStudentMiddleName(e.target.value)}/>
                {/* Last Name */}
                <label for="student_last_name">Student Last Name:</label>
                <input type="text" id="student_last_name" name="student_last_name" onChange={(e)=>setStudentLastName(e.target.value)}/>
                {/* Grade */}
                <label for="student_grade">Student Grade:</label>
                <select id="student_grade" name="student_grade" className="select_text" onChange={(e)=>setStudentGrade(e.target.value)}>
                    {GRADES.map(grade =>
                        <option key={grade.abr} value={grade.abr} >{grade.name}</option>
                    )}
                </select>
                {/* Submit Button */}
                <input className="submit-button" type="submit" value="Submit To School"></input>
            </div>
        </form>
    </>);
}