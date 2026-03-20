import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";
import { Navbar } from "../../components/Navbar/Navbar";
import { Footer } from "../../components/Footer/Footer";
import Loader from "../../components/Loader/Loader";
import styles from "./Games.module.css";

const LIMIT = 20;

export const Games = () => {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const [inputValue, setInputValue] = useState("");
  const [search, setSearch] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  const [bg] = useState<any>(
    localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user") || "{}")["background"]
      : null
  );

  useEffect(() => {
    setLoading(true);
    setError(null);

    axios
      .get("http://localhost:4000/api/games")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data.games || [];
        const filtered = data.filter((game: any) =>
          game.name.toLowerCase().includes(search.toLowerCase())
        );

        setGames(filtered);
        setPage(1);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [search]);

  const pages = Math.ceil(games.length / LIMIT);
  const paginatedGames = games.slice((page - 1) * LIMIT, page * LIMIT);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSearch(inputValue);
    }
  };

  return (
    <div
      className={styles.page}
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Navbar />

      {loading && <Loader />}
      {!loading && error && (
        <div className="text-danger text-center py-5">Error: {error}</div>
      )}

      {!loading && !error && (
        <>
          <div className={`${styles.page} ${styles.content} container py-4`}>
            <h1 className={styles.title}>Games</h1>

            <div className="mb-4 d-flex gap-2">
              <input
                ref={inputRef}
                type="text"
                className="form-control"
                placeholder="Search game..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
              <button
                className="btn btn-warning"
                onClick={() => setSearch(inputValue)}
              >
                Search
              </button>
            </div>

            <div className="row g-4">
              {paginatedGames.length > 0 ? (
                paginatedGames.map((game) => (
                  <div key={game._id} className="col-sm-4 col-md-3 col-lg-3">
                    <NavLink
                      to={`/games/${game._id}`}
                      className="text-decoration-none text-dark"
                    >
                      <div className="card h-100">
                        <img
                          src={game.icon}
                          className={`card-img-top ${styles.icon}`}
                          alt={game.name}
                        />
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
                    </NavLink>
                  </div>
                ))
              ) : (
                <div className="text-center py-5">
                  <h5 className={styles.title}>No games found</h5>
                </div>
              )}
            </div>

            {pages > 1 && (
              <div className="d-flex justify-content-center align-items-center mt-5 gap-2 flex-wrap">
                {Array.from({ length: pages }, (_, index) => index + 1).map(
                  (pageNumber) => (
                    <button
                      key={pageNumber}
                      className={`btn ${page === pageNumber ? "btn-warning" : "btn-outline-warning"
                        }`}
                      onClick={() => setPage(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
          <Footer />
        </>
      )}
    </div>
  );
};