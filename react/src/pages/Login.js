
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login(props) {
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  function btnLogin(event) {
    axios({
      method: "POST",
      url: "http://127.0.0.1:5000/login",
      data: {
        email: loginForm.email,
        password: loginForm.password,
      },
    })
      .then((response) => {
        console.log(response);
        props.setToken(response.data.access_token);
        alert("Successfully Login");
        localStorage.setItem("email", loginForm.email);
        navigate("/cv");
      })
      .catch((error) => {
        if (error.response) {
          console.log(error.response);
          console.log(error.response.status);
          console.log(error.response.headers);
          if (error.response.status === 401) {
            alert("Invalid credentials");
          }
        }
      });

    setLoginForm({
      email: "",
      password: "",
    });

    event.preventDefault();
  }

  function handleChange(event) {
    const { value, name } = event.target;
    setLoginForm((prevLoginForm) => ({
      ...prevLoginForm,
      [name]: value,
    }));
  }

  return (
    <div className="container h-50">
      <div className="container-fluid h-custom">
        <div className="row d-flex justify-content-center align-items-center h-50">
          <div className="col-md-8 col-lg-6 col-xl-4 offset-xl-1">
            <div className="p-3 mb-2 bg-primary bg-gradient text-white">
              Log Into Your Account
            </div>
            <form onSubmit={btnLogin}>
              <div className="form-outline mb-4">
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={handleChange}
                  name="email"
                  className="form-control form-control-lg"
                  placeholder="Enter a valid email address"
                />
              </div>

              <div className="form-outline mb-4">
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={handleChange}
                  name="password"
                  className="form-control form-control-lg"
                  placeholder="Enter password"
                />
              </div>

              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="form-check">
                  <input
                    className="form-check-input me-2"
                    type="checkbox"
                    value=""
                    id="form2Example3"
                  />
                  <label className="form-check-label" htmlFor="form2Example3">
                    Remember me
                  </label>
                </div>
                <a href="#!" className="text-body">
                  Forgot password?
                </a>
              </div>

              <div className="d-grid gap-2 col-6 mx-auto">
                <button className="btn btn-primary" type="submit">
                  Log In
                </button>
              </div>
              <p className="small fw-bold mt-2 pt-1 mb-0">
                Don't have an account?{" "}
                <a href="/register" className="link-danger">
                  Register
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
