// index.js

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route,Routes } from 'react-router-dom';
import './index.css';
import App from './App';
import Navbar from './Component/Navbar';
import About from './Component/About';
import './bootstrap.min.css';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <>
    <Navbar/>
    <Router>
      <Routes>
      <Route path="/" exact element={<App/>} />
      <Route path="/about"  element={<About/>} />
      </Routes>
      {/* Add more routes as needed */}
    </Router>
    </>,
  document.getElementById('root')
);

reportWebVitals();
