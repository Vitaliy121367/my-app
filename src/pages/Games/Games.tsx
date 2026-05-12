import React, { useEffect, useState } from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";
import { Navbar } from "../../components/Navbar/Navbar";
import { Footer } from "../../components/Footer/Footer";
import Loader from "../../components/Loader/Loader";
import styles from "../../components/styles.module.css";
import style from "./Games.module.css";

export const Games = () => {
  const apiUrl =
    "https://myfastrunsapi0305-hzekc5edahebbtca.polandcentral-01.azurewebsites.net";

  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [inputValue, setInputValue] = useState("");
  const [search, setSearch] = useState("");

  const bg = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") || "{}")["background"]
    : null;

  useEffect(() => {
    setLoading(true);
    setError(null);

    axios
      .get(`${apiUrl}/api/games/games`, {
        params: { page, search },
      })
      .then((res) => {
        setGames(res.data.games || []);
        setPages(res.data.pages || 1);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page, search]);

  const handleSearch = () => {
    if (page !== 1) {
      setPage(1);
    }
    setSearch(inputValue);
  };

  const getPages = () => {
    const range = 2;
    const start = Math.max(1, page - range);
    const end = Math.min(pages, page + range);

    const result = [];
    for (let i = start; i <= end; i++) result.push(i);

    return result;
  };

  return (
    <div
      className={styles.page}
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
      }}
    >
      <Navbar />

      <div className={styles.content}>
        {loading && <Loader />}

        {!loading && error && (
          <div className="text-danger text-center py-5">
            Error: {error}
          </div>
        )}

        {!loading && !error && (
          <div className={style.inner}>
            <h1 className={styles.title}>Games</h1>

            <div className="mb-4 d-flex gap-2">
              <input
                type="text"
                className="form-control"
                placeholder="Search game..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
              />
              <button className="btn btn-warning" onClick={handleSearch}>
                Search
              </button>
            </div>

            <div className="row g-4">
              {games.length > 0 ? (
                games.map((game) => (
                  <div key={game._id} className="col-sm-4 col-md-3 col-lg-3">
                    <NavLink
                      to={`/games/${game._id}`}
                      className="text-decoration-none text-dark"
                    >
                      <div className="card h-100">
                        <img
                          src={game.icon}
                          className={`card-img-top ${style.icon}`}
                          alt={game.name}
                        />
                        <div className="card-body">
                          <h5 className="card-title">{game.name}</h5>
                          <p className="card-text">Year: {game.year}</p>
                          <div>
                            {game.platform.map((p: string) => (
                              <span
                                key={p}
                                className="badge bg-secondary me-1"
                              >
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
              <div className="d-flex justify-content-center mt-5 gap-2 flex-wrap">
                {getPages().map((pageNumber) => (
                  <button
                    key={pageNumber}
                    className={`btn ${
                      page === pageNumber
                        ? "btn-warning"
                        : "btn-outline-warning"
                    }`}
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};