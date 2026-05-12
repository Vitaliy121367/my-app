import { NavLink, useNavigate, useParams } from "react-router-dom";
import { Navbar } from "../../components/Navbar/Navbar";
import { Footer } from "../../components/Footer/Footer";
import { useEffect, useRef, useState } from "react";
import Loader from "../../components/Loader/Loader";
import axios from "axios";
import styles from "../../components/styles.module.css";
import style from "./Game.module.css";

const LIMIT = 10;

export const Game = () => {
  const apiUrl="myfastrunsapi0305-hzekc5edahebbtca.polandcentral-01.azurewebsites.net";
    const [game, setGame] = useState<any>(null);
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [inputValue, setInputValue] = useState("");
    const [search, setSearch] = useState("");

    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);

    const inputRef = useRef<HTMLInputElement>(null);

    const user = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user") || "{}")
        : null;

    const [bg] = useState<any>(user?.background || null);

    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const gameRes = await axios.get(
                    `${apiUrl}/api/games/${id}`
                );
                setGame(gameRes.data);

                const recordsRes = await axios.get(
                    `${apiUrl}/api/records/game`,
                    {
                        params: {
                            id: gameRes.data._id,
                            page,
                            search
                        }
                    }
                );

                setRecords(recordsRes.data.records || []);
                setPages(recordsRes.data.pages || 1);
                if (recordsRes.data.page !== page) {
                    setPage(recordsRes.data.page);
                }

            } catch (err: any) {
                setError(err.message || "Error fetching data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, page, search]);

    const handleSearch = () => {
        setPage(1);
        setSearch(inputValue);
    };

    return (
        <div
            className={styles.page}
            style={{
                backgroundImage: `url(${bg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
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

                {!loading && !error && game && (
                    <div className="container py-4">
                        <h1 className={`card-title ${styles.title}`}>
                            {game.name}
                        </h1>

                        <div className="card mb-4">
                            <img
                                src={game.icon}
                                className={`card-img-top ${style.gameImage}`}
                                alt={game.name}
                            />

                            <div className="card-body d-flex justify-content-between align-items-center">
                                <p className="mb-0">
                                    <strong>Year:</strong> {game.year}
                                </p>

                                {user?.role !== "blocked" && user && (
                                    <NavLink
                                        to={`/addrecord/${game._id}`}
                                        className="btn btn-primary"
                                    >
                                        Add Record
                                    </NavLink>
                                )}
                            </div>

                            <div className="card-body">
                                {game.platform.map((p: string) => (
                                    <span key={p} className="badge bg-secondary me-1">
                                        {p}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="d-flex gap-2 mb-3">
                            <input
                                ref={inputRef}
                                type="text"
                                className="form-control"
                                placeholder="Search user..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) =>
                                    e.key === "Enter" && handleSearch()
                                }
                            />
                            <button className="btn btn-warning" onClick={handleSearch}>
                                Search
                            </button>
                        </div>

                        <div className="table-responsive">
                            <table className={`table table-hover ${style.tableCustom}`}>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>User</th>
                                        <th>Platform</th>
                                        <th>Time</th>
                                        <th>Version</th>
                                        <th>Date Upload</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="text-center">
                                                No records
                                            </td>
                                        </tr>
                                    )}

                                    {records.map((record, index) => (
                                        <tr
                                            key={record._id}
                                            style={{ cursor: "pointer" }}
                                            onClick={() => navigate(`/record/${record._id}`)}
                                        >
                                            <td>{(page - 1) * LIMIT + index + 1}</td>
                                            <td>{record.userId?.name}</td>
                                            <td>{record.platform}</td>
                                            <td>{record.time}</td>
                                            <td>{record.version}</td>
                                            <td>
                                                {new Date(record.dateUpload).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {pages > 1 && (
                            <div className="d-flex justify-content-center mt-4 gap-2">
                                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                                    <button
                                        key={p}
                                        className={`btn ${page === p ? "btn-warning" : "btn-outline-warning"}`}
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

            <Footer />
        </div>
    );
};