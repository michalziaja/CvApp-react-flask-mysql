import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import Modal from "react-modal";

Modal.setAppElement("#root");

function formattedDate(dateString) {
    if (!dateString) return 'N/A';

    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const parsedDate = new Date(dateString);

    if (isNaN(parsedDate)) {
        return 'Invalid Date';
    }

    return parsedDate.toLocaleDateString(undefined, options);
}

export default function ViewUser() {
    const { cv } = useParams();
    const [user_data, setUser] = useState({
        cv: "",
        job: "",
        company: "",
        date: "",
        expire: "",
        rejected: "",
        url: ""
    });
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        getUserDetails();
    });

    const getUserDetails = async () => {
        const token = localStorage.getItem('token');
        const config = {
            headers: {
                Authorization: 'Bearer ' + token
            }
        };

        try {
            const response = await axios.get(`http://127.0.0.1:5000/view/${cv}`, config);
            setUser(response.data);
        } catch (error) {
            console.error("Error fetching user details:", error);
            // Handle error gracefully, e.g., redirect or show an error message
        }
    };

    const openModal = () => {
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    return (
        <div>
            <div className="container">
            <div className="row justify-content-center mt-3">
                    <div className="col-8">
                        <h1>Application Details</h1>
                        <h3><Link to="/cv" className="btn btn-danger" style={{ marginRight: "10px" }}>
                            Back
                        </Link>
                        <Link
                            to={`/cv/view/${cv}/edit`}
                            className="btn btn-info"
                        >
                            Edit
                        </Link>
                        </h3>
                        <table className="table table-bordered mt-3">
                            <tbody>
                                <tr>
                                    <th>ID</th>
                                    <td>{user_data.cv}</td>
                                </tr>
                                <tr>
                                    <th>Position</th>
                                    <td>{user_data.job}</td>
                                </tr>
                                <tr>
                                    <th>Company</th>
                                    <td>{user_data.company}</td>
                                </tr>
                                <tr>
                                    <th>Date</th>
                                    <td>{formattedDate(user_data.date)}</td>
                                </tr>
                                <tr>
                                    <th>Expire</th>
                                    <td>{formattedDate(user_data.expire)}</td>
                                </tr>
                                <tr>
                                    <th>Screenshot</th>
                                    <td>
                                        {user_data.url && (
                                            <div>
                                                <br />
                                                <img
                                                    src={`data:image/png;base64,${user_data.url}`}
                                                    alt="Screenshot"
                                                    style={{ maxWidth: "100%" }}
                                                    onClick={openModal}
                                                />
                                                <Modal
                                                    isOpen={showModal}
                                                    onRequestClose={closeModal}
                                                    contentLabel="Obraz"
                                                >
                                                    <img
                                                        src={`data:image/png;base64,${user_data.url}`}
                                                        alt="Screenshot"
                                                        style={{ maxWidth: "100%" }}
                                                    />
                                                </Modal>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}