import React from 'react';
import './App.module.css';
import { BrowserRouter, Route, Routes } from 'react-router';
import { Games } from './pages/Games/Games';
import { Register } from './pages/Register/Register';
import { Login } from './pages/Login/Login';
import { Game } from './pages/Game/Game';
import { News } from './pages/News/News';
import { Profile } from './pages/Profile/Profile';
import { NotFoundPage } from './pages/NotFoundPage/NotFoundPage';
import { LastLoaded } from './pages/LastLoaded/LastLoaded';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Games />} />
          <Route path="/game" element={<Game />} />
          <Route path="/news" element={<News />} />
          <Route path="/lastloaded" element={<LastLoaded />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
