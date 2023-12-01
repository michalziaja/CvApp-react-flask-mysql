import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Link } from "react-router-dom";

export default function EditCv() {
    const navigate = useNavigate();
    const { cv } = useParams();
    const [inputs, setInputs] = useState({ job: "", company: "", expire: "" });

    useEffect(() => {
        getUser();
    }, [cv]);

    const getUser = async () => {
        try {
            const token = localStorage.getItem("token");
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            const response = await axios.get(`http://127.0.0.1:5000/view/${cv}`, config);
            setInputs({
                ...response.data,
                // Konwersja daty do formatu zgodnego z input type="date"
                expire: formatDateForInput(response.data.expire),
            });
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setInputs((prevInputs) => ({ ...prevInputs, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const token = localStorage.getItem("token");
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            await axios.put(`http://127.0.0.1:5000/update/${cv}`, inputs, config);
            navigate("/cv");
        } catch (error) {
            console.error("Error updating user data:", error);
        }
    };

    // Funkcja konwertująca datę do formatu zgodnego z input type="date"
    const formatDateForInput = (dateString) => {
        const date = new Date(dateString);
        const formattedDate = date.toISOString().split("T")[0]; // YYYY-MM-DD
        return formattedDate;
    };

    return (
        <div>
            <div className="container">
                <div className="row justify-content-center mt-3">
                    <div className="col-0"></div>
                    <div className="col-6">
                        <h1>Edit CV info</h1>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label>Job</label>
                                <input
                                    type="text"
                                    value={inputs.job}
                                    className="form-control"
                                    name="job"
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label>Company</label>
                                <input
                                    type="text"
                                    value={inputs.company}
                                    className="form-control"
                                    name="company"
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label>Expire Date</label>
                                <input
                                    type="date"
                                    value={inputs.expire}
                                    className="form-control"
                                    name="expire"
                                    onChange={handleChange}
                                />
                            </div>
                            <button type="submit" name="update" className="btn btn-primary" style={{ marginRight: "10px" }}>
                                Save
                            </button>
                            <Link to="/cv" className="btn btn-danger">
                                Back
                            </Link>
                        </form>
                    </div>
                    <div className="col-2"></div>
                </div>
            </div>
        </div>
    );
}
