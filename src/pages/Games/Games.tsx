import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Outlet } from "react-router-dom";
import { Navbar } from "../../components/Navbar/Navbar";
import { Footer } from "../../components/Footer/Footer";
import Loader from "../../components/Loader/Loader";
import styles from './Games.module.css';

export const Games = () => {
  const [games, setGames] = useState<any[]>([]);
  const [bg, setBg] = useState<any>(localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") || "{}")["background"] : null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const effectRan = useRef(false);

  useEffect(() => {
    if (effectRan.current) return;
    effectRan.current = true;

    axios.get("http://localhost:4000/api/games")
      .then(res => setGames(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));

  }, []);

  return (
    <div
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh"
      }}
    >
      <Navbar />

      {loading && <Loader />}

            {!loading && error && (
                <div className="text-danger text-center py-5">
                    Error: {error}
                </div>
            )}

           {!loading && !error && ( 
      <div className="container py-4">
        <h1 className={styles.title}>Games</h1>
        <div className="row g-4">
          {games.map(game => (
            <div key={game._id} className="col-sm-4 col-md-3 col-lg-3">
              <div className="card h-100">
                <img src={game.icon} className={`card-img-top ${styles.icon}`} />
                <div className="card-body">
                  <h5 className="card-title">{game.name}</h5>
                  <p className="card-text">Year: {game.year}</p>
                  <div>
                    {game.platform.map((p: string) => (
                      <span key={p} className="badge bg-secondary me-1">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>)}
      <Footer />

    </div>
  );
};