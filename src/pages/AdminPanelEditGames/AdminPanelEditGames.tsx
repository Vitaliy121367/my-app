import { useEffect, useState } from "react";
import Loader from "../../components/Loader/Loader";
import styles from "../../components/styles.module.css";
import style from "./AdminPanelEditGames.module.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const availablePlatforms = ["Phone", "PC", "Console"];
const LIMIT = 20;

export const AdminPanelEditGames = () => {
    const apiUrl = "https://myapi0305-cua6cdb7ghdxgtfk.polandcentral-01.azurewebsites.net";
    const [games, setGames] = useState<GameType[]>([]);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [inputValue, setInputValue] = useState("");
    const [search, setSearch] = useState("");

    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    const currentUser = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user") || "{}")
        : null;

    const fetchGames = async (pageNumber: number, searchValue: string) => {
        setLoading(true);
        setError(null);

        try {
            const res = await axios.get(`${apiUrl}/api/games/games`, {
                params: { page: pageNumber, search: searchValue },
            });

            if (Array.isArray(res.data)) {
                setGames(res.data);
                setPages(1);
            } else {
                setGames(res.data.games || []);
                setPages(res.data.pages || 1);

                if (res.data.page !== pageNumber) {
                    setPage(res.data.page);
                }
            }
        } catch (err: any) {
            setError(err.message || "Error fetching games");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGames(page, search);
    }, [page, search]);

    useEffect(() => {
        if (!currentUser || currentUser.role !== "admin") {
            navigate("/");
        }
    }, [currentUser, navigate]);

    const handleSearch = () => {
        if (page !== 1) setPage(1);
        setSearch(inputValue);
    };

    const updateGame = async (gameId: string, updatedFields: Partial<GameType>) => {
        try {
            await axios.patch(
                `${apiUrl}/api/games/${gameId}`,
                updatedFields,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setGames((prev) =>
                prev.map((g) =>
                    g._id === gameId ? { ...g, ...updatedFields } : g
                )
            );
        } catch (err) {
            console.error(err);
        }
    };

    const togglePlatform = (game: GameType, platform: string) => {
        const updatedPlatforms = game.platform.includes(platform)
            ? game.platform.filter((p) => p !== platform)
            : [...game.platform, platform];

        updateGame(game._id, { platform: updatedPlatforms });
    };

    const deleteGame = async (gameId: string) => {
        if (!window.confirm("Удалить игру?")) return;

        try {
            await axios.delete(
                `${apiUrl}/api/games/${gameId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setGames((prev) => prev.filter((g) => g._id !== gameId));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className={style.page}>
            {loading && <Loader />}

            {!loading && error && (
                <div className="text-danger text-center py-5">{error}</div>
            )}

            {!loading && !error && (
                <div className={`${style.page} ${styles.content} container py-4`}>
                    <h1 className={styles.title}>Edit Games</h1>

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
                        <button className="btn btn-info" onClick={handleSearch}>
                            Search
                        </button>
                    </div>

                    {games.length === 0 ? (
                        <div className="text-center text-light mt-5">
                            No games found.
                        </div>
                    ) : (<div className="table-responsive">
                        <table className="table table-dark table-striped">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Icon</th>
                                    <th>Year</th>
                                    <th>Platforms</th>
                                    <th>Tools</th>
                                </tr>
                            </thead>
                            <tbody>
                                {games.map((game, index) => (
                                    <tr key={game._id}>
                                        <th>{(page - 1) * LIMIT + index + 1}</th>

                                        <td>
                                            <input
                                                className="form-control"
                                                value={game.name}
                                                onChange={(e) =>
                                                    updateGame(game._id, { name: e.target.value })
                                                }
                                            />
                                        </td>

                                        <td>
                                            <input
                                                className="form-control"
                                                value={game.icon}
                                                onChange={(e) =>
                                                    updateGame(game._id, {
                                                        icon: e.target.value,
                                                    })
                                                }
                                            />
                                        </td>

                                        <td>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={game.year}
                                                onChange={(e) =>
                                                    updateGame(game._id, {
                                                        year: Number(e.target.value),
                                                    })
                                                }
                                            />
                                        </td>

                                        <td>
                                            {availablePlatforms.map((p) => (
                                                <div key={p} className="form-check form-check-inline">
                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input"
                                                        checked={game.platform?.includes(p)}
                                                        onChange={() => togglePlatform(game, p)}
                                                    />
                                                    <label className="form-check-label">{p}</label>
                                                </div>
                                            ))}
                                        </td>

                                        <td>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => deleteGame(game._id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    )}

                    {pages > 1 && (
                        <div className="d-flex justify-content-center mt-4 gap-2">
                            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                                <button
                                    key={p}
                                    className={`btn ${page === p ? "btn-info" : "btn-outline-info"}`}
                                    onClick={() => setPage(p)}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};