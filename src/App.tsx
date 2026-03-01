import React from 'react';
import './App.module.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Games } from './pages/Games/Games';
import { Register } from './pages/Register/Register';
import { Login } from './pages/Login/Login';
import { Game } from './pages/Game/Game';
import { News } from './pages/News/News';
import { Profile } from './pages/Profile/Profile';
import { NotFoundPage } from './pages/NotFoundPage/NotFoundPage';
import { LastLoaded } from './pages/LastLoaded/LastLoaded';
import { Settings } from './pages/Settings/Settings';
import { Record } from './pages/Record/Record';
import { AddRecord } from './pages/AddRecord/AddRecord';
import { ModerPanel } from './pages/ModerPanel/ModerPanel';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Games />} />
          <Route path="/games/:id" element={<Game />} />
          <Route path="/news" element={<News />} />
          <Route path="/lastloaded" element={<LastLoaded />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/ModerPanel" element={<ModerPanel />} />
          <Route path="/record/:id" element={<Record />} />
          <Route path="/addrecord/:id" element={<AddRecord />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;