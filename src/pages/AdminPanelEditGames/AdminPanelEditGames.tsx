import { useEffect, useState } from "react";
import Loader from "../../components/Loader/Loader";
import styles from "./AdminPanelEditGames.module.css";
import axios from "axios";
import { useNavigate } from "react-router";

const availablePlatforms = ["Phone", "PC", "Console"];

export const AdminPanelEditGames = () => {
    const [games, setGames] = useState<GameType[]>([]);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    const currentUser = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user") || "{}")
        : null;

    const fetchGames = async (pageNumber: number) => {
        setLoading(true);
        setError(null);

        try {
            const res = await axios.get("http://localhost:4000/api/games", {
                params: { page: pageNumber },
            });

            console.log("API:", res.data);

            if (Array.isArray(res.data)) {
                setGames(res.data);
                setPages(1);
            } else {
                setGames(res.data.games || []);
                setPages(res.data.pages || 1);
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Error fetching games");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGames(page);
    }, [page]);

    useEffect(() => {
        if (!currentUser || currentUser.role !== "admin") {
            navigate("/");
        }
    }, [currentUser, navigate]);

    const updateGame = async (gameId: string, updatedFields: Partial<GameType>) => {
        try {
            await axios.patch(
                `http://localhost:4000/api/games/${gameId}`,
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
            console.error("Update error:", err);
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
                `http://localhost:4000/api/games/${gameId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setGames((prev) => prev.filter((g) => g._id !== gameId));
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    return (
        <div className={styles.page}>
            {loading && <Loader />}

            {!loading && error && (
                <div className="text-danger text-center py-5">{error}</div>
            )}

            {!loading && !error && (
                <div className={`${styles.page} ${styles.content} container py-4`}>
                    <h1 className={styles.title}>Edit Games</h1>

                    {games.length === 0 ? (
                        <div className="text-center text-light mt-5">
                            ❗ Игры не найдены (проверь backend)
                        </div>
                    ) : (
                        <table className="table table-dark table-striped">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Year</th>
                                    <th>Platforms</th>
                                    <th>Tools</th>
                                </tr>
                            </thead>
                            <tbody>
                                {games.map((game, index) => (
                                    <tr key={game._id}>
                                        <th>{(page - 1) * 10 + index + 1}</th>

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
                    )}

                    {pages > 1 && (
                        <div className="d-flex justify-content-center mt-4 gap-2">
                            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                                <button
                                    key={p}
                                    className={`btn ${page === p ? "btn-info" : "btn-outline-info"
                                        }`}
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