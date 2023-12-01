import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export default function AddCv() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token'); // Get the token from local storage

  const [inputs, setInputs] = useState({
    job: "",
    company: "",
    url: "",
    expire: ""
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setInputs((prevInputs) => ({ ...prevInputs, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const config = {
        headers: {
          Authorization: 'Bearer ' + token
        }
      };

      const response = await axios.post('http://127.0.0.1:5000/add', inputs, config);
      console.log(response.data);

      setTimeout(() => {
        setLoading(false);
        navigate("/cv");
      }, 4000);
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="container">
        <div className="row justify-content-left mt-3">
          <div className="col-2"></div>
          <div className="col-5">
            <h1>Add New Job Application</h1>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label>Job Position</label>
                <input
                  type="text"
                  className="form-control"
                  name="job"
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label>Company</label>
                <input
                  type="text"
                  className="form-control"
                  name="company"
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label>Url</label>
                <input
                  type="text"
                  className="form-control"
                  name="url"
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label>Expire Date</label>
                <input
                  type="date"
                  className="form-control"
                  name="expire"
                  onChange={handleChange}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{marginRight: "10px"}}
              >
                {loading ? "Saving..." : "Save"}
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
