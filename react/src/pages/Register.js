import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
  const [registerForm, setRegisterForm] = useState({
    email: "",
    password: "",
    repeatPassword: "",
    agreeTerms: false,
  });

  const navigate = useNavigate();

  function registerUser(event) {
    event.preventDefault();

    if (registerForm.password !== registerForm.repeatPassword) {
      alert("Passwords do not match");
      return;
    }

    axios({
      method: "POST",
      url: "http://127.0.0.1:5000/register",
      data: {
        email: registerForm.email,
        password: registerForm.password,
      },
    })
      .then((response) => {
        console.log(response);
        alert("Successfully registered as a new user");
        navigate("/"); // Redirect to the Login page
      })
      .catch((error) => {
        if (error.response) {
          console.log(error.response);
          console.log(error.response.status);
          console.log(error.response.headers);
          if (error.response.status === 409) {
            alert("Email already exists");
          }
        }
      });

    setRegisterForm({
      email: "",
      password: "",
      repeatPassword: "",
      agreeTerms: false,
    });
  }

  function handleRegisterChange(event) {
    const { name, value, checked, type } = event.target;
    const newValue = type === "checkbox" ? checked : value;
    setRegisterForm((prevRegisterForm) => ({
      ...prevRegisterForm,
      [name]: newValue,
    }));
  }

  return (
     <div className="container h-50">
      <div className="container-fluid h-custom">
      <div className="row d-flex justify-content-center align-items-center h-50">
        <div className="col-md-8 col-lg-6 col-xl-4 offset-xl-1">
          <div className="p-3 mb-2 bg-primary bg-gradient text-white">
            Register New Account
          </div>

      <form onSubmit={registerUser}>
        <div className="form-outline mb-4">
            <input
            type="email"
            name="email"
            value={registerForm.email}
            onChange={handleRegisterChange}
            className="form-control form-control-lg"
            placeholder="Enter a valid email address"
            required
          />
        </div>
        <div className="form-outline mb-4">
            <input
            type="password"
            name="password"
            value={registerForm.password}
            onChange={handleRegisterChange}
            className="form-control form-control-lg"
            placeholder="Enter password"
            required
          
          />

        </div>
        <div className="form-outline mb-4">
            <input
            type="password"
            name="repeatPassword"
            value={registerForm.repeatPassword}
            onChange={handleRegisterChange}
            className="form-control form-control-lg"
            placeholder="Repeat password"
            required
          />
        </div>
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              name="agreeTerms"
              checked={registerForm.agreeTerms}
              onChange={handleRegisterChange}
              className="form-check-input"
            />{" "}
            I agree to the terms and conditions
          </label>
        </div>
        <div className="d-grid gap-2 col-6 mx-auto">
        <button className="btn btn-primary" type="submit">
                Register
        </button></div>
      </form>
    </div>
</div>
</div>
</div>
)}
  
export default Register;
