import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Footer from './pages/Footer';
import Login from './pages/Login';
import Header from './pages/Header';
import Profile from './pages/Profile';
import useToken from './pages/UseToken';
import Register from './pages/Register';

import ListCv from './pages/ListCv';
import AddCv from './pages/AddCv';
import EditCv from './pages/EditCv';
import ViewCv from './pages/ViewCv';


function App() {
  const { token, removeToken, setToken } = useToken();

  return (
    <div className="vh-100 gradient-custom">
      <div className="container">
        <h1 className="page-header text-center">Token-Based Authentication Integration in ReactJS and Python Flask, along with Offer Screening and Database Storage using SQLAlchemy</h1>
      
        <BrowserRouter>
          <Header token={removeToken} />
          {!token && token !== "" && token !== undefined ? (
            <>
              <Routes>
                <Route path="/" element={<Login setToken={setToken} />} />
                <Route path="/register" element={<Register setToken={setToken} />} />
                <Route path="/profile" element={<Profile token={token} setToken={setToken} />} />
                
                <Route path="/cv/view/:cv" element={<ViewCv token={token} setToken={setToken} />} />
                <Route path="/cv" element={<ListCv token={token} setToken={setToken} />} />
                <Route path="/add" element={<AddCv token={token} setToken={setToken} />} />
                <Route path="/cv/view/:cv/edit" element={<EditCv token={token} setToken={setToken} />} />
                            
              </Routes>
            </>
          ) : (
            <>
              <Routes>
                <Route path="/" element={<Login setToken={setToken} />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile token={token} setToken={setToken} />} />
                <Route path="/cv/view/:cv" element={<ViewCv token={token} setToken={setToken} />} />
                <Route path="/cv" element={<ListCv token={token} setToken={setToken} />} />
                <Route path="/add" element={<AddCv token={token} setToken={setToken} />} />
                <Route path="/cv/view/:cv/edit" element={<EditCv token={token} setToken={setToken} />} />

              </Routes>
            </>
          )}
        </BrowserRouter>
          
      </div>
      <Footer/>
    </div>
    
  );
}

export default App;
