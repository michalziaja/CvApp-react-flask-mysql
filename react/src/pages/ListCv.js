import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./styles.css";

function formattedDate(dateString) {
    if (!dateString) return 'N/A';

    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

export default function ListUserPage() {
    const [users, setUsers] = useState([]);


    
    const getUsers = async () => {
        const token = localStorage.getItem("token");
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };

        try {
            const response = await axios.get("http://127.0.0.1:5000/list", config);
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching user details:", error);
            // Handle error gracefully, e.g., redirect or show an error message
        }
    };

    useEffect(() => {
        getUsers();
    }, []); // Empty dependency array

    const handleRejectedChange = async (cv, rejected) => {
        try {
            const token = localStorage.getItem("token");
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            await axios.put(`http://127.0.0.1:5000/updatecv/${cv}`, { rejected: rejected ? 1 : 0 }, config);
            // Update the users state
            setUsers((prevUsers) =>
                prevUsers.map((user_data) =>
                    user_data.cv === cv ? { ...user_data, rejected } : user_data
                )
            );
        } catch (error) {
            console.error("Error updating rejected status:", error);
            alert("Failed to update rejected status");
        }
    };

    const deleteUser = (cv) => {
        const token = localStorage.getItem("token");
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
        axios.delete(`http://127.0.0.1:5000/delete/${cv}`, config).then(function (response) {
            console.log(response.data);
            getUsers();
        });
        alert("Successfully Deleted");
    };

    return (
        <div>
            <div className="container h-100">
                <div className="row h-100">
                    <div className="col-12">
                        <p>
                            <br></br>
                            <Link to="/add" className="btn btn-success">
                                Add New
                            </Link>{" "}
                        </p>

                        <table className="table table-bordered table-striped">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Job Position</th>
                                    <th>Company</th>
                                    <th>Date Added</th>
                                    <th>Expire</th>
                                    <th>Screenshot</th>
                                    <th>Rejected</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user_data, index) => (
                                    <tr key={index} className={user_data.rejected ? "rejected" : ""}>
                                        <td>{index + 1}</td>
                                        <td>{user_data.job}</td>
                                        <td>{user_data.company}</td>
                                        <td>{formattedDate(user_data.date)}</td>
                                        <td>{formattedDate(user_data.expire)}</td>
                                        <td>{user_data.url ? "Yes" : "No"}</td>
                                        <td>
                                            <select
                                                value={user_data.rejected}
                                                onChange={(e) =>
                                                    handleRejectedChange(user_data.cv, e.target.value === "true")
                                                }
                                            >
                                                <option value={false}>No</option>
                                                <option value={true}>Yes</option>
                                            </select>
                                        </td>
                                        <td>
                                            <Link
                                                to={`view/${user_data.cv}/`}
                                                className="btn btn-warning"
                                                style={{ marginRight: "10px" }}
                                            >
                                                View
                                            </Link>
                                            <Link
                                                to={`view/${user_data.cv}/edit`}
                                                className="btn btn-info"
                                                style={{ marginRight: "10px" }}
                                            >
                                                Edit
                                            </Link>
                                            <button onClick={() => deleteUser(user_data.cv)} className="btn btn-danger">
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
