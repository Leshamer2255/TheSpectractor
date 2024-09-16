import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; 
import Header from './Pages/Header/Header';
import Footer from './Pages/Footer/Footer';
import MyMap from './Components/MyMap';
import 'leaflet/dist/leaflet.css';


const App = () => {

  
  return (
    <Router>
      <div className="app-container">
        <Header />
        <Routes> 
          <Route path="/" element={<MyMap />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
