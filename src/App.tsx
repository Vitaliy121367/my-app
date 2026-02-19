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
import { Settings } from './pages/Settings/Settings';
import { AddRecord } from './pages/AddRecord/AddRecord';
import { Record } from './pages/Record/Record';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Games />} />
          <Route path="/games/:id" element={<Game />} />
          <Route path="/addrecord" element={<AddRecord />} />
          <Route path="/record/:id" element={<Record />} />
          <Route path="/news" element={<News />} />
          <Route path="/lastloaded" element={<LastLoaded />} />
          <Route path="/settings" element={<Settings />} />
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
