import { NavLink, useNavigate, useParams } from "react-router-dom";
import { Navbar } from "../../components/Navbar/Navbar";
import { Footer } from "../../components/Footer/Footer";
import { useEffect, useRef, useState } from "react";
import Loader from "../../components/Loader/Loader";
import axios from "axios";
import styles from "./Game.module.css";

export const Game = () => {
    const [game, setGame] = useState<any>(null);
    const [allRecords, setAllRecords] = useState<any[]>([]);
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [inputValue, setInputValue] = useState("");

    const inputRef = useRef<HTMLInputElement>(null);

    const user = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user") || "{}")
        : null;

    const [bg] = useState<any>(user?.background || null);

    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const timeToSeconds = (time: string) => {
        const [h, m, s] = time.split(":").map(Number);
        return h * 3600 + m * 60 + s;
    };

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const gameRes = await axios.get(
                    `http://localhost:4000/api/games/${id}`
                );
                setGame(gameRes.data);

                const recordsRes = await axios.get(
                    `http://localhost:4000/api/records/game?id=${gameRes.data._id}`
                );

                const recordsArray = recordsRes.data.records || [];

                const approvedRecords = recordsArray.filter(
                    (r: any) => r.status === "approved"
                );

                const bestRecordsMap: { [key: string]: any } = {};

                approvedRecords.forEach((r: any) => {
                    const userId = r.userId?._id;
                    const platform = r.platform;
                    if (!userId || !platform) return;

                    const key = `${userId}_${platform}`;

                    if (
                        !bestRecordsMap[key] ||
                        timeToSeconds(r.time) <
                        timeToSeconds(bestRecordsMap[key].time)
                    ) {
                        bestRecordsMap[key] = r;
                    }
                });

                const bestRecords = Object.values(bestRecordsMap).sort(
                    (a: any, b: any) =>
                        timeToSeconds(a.time) - timeToSeconds(b.time)
                );

                setAllRecords(bestRecords);
                setRecords(bestRecords);
            } catch (err: any) {
                setError(err.message || "Error fetching data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleSearch = () => {
        const filtered = allRecords.filter((r) =>
            r.userId?.name
                ?.toLowerCase()
                .includes(inputValue.toLowerCase())
        );
        setRecords(filtered);
    };

    return (
        <div
            style={{
                backgroundImage: `url(${bg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                minHeight: "100vh",
            }}
        >
            <Navbar />

            {loading && <Loader />}

            {!loading && error && (
                <div className="text-danger text-center py-5">
                    Error: {error}
                </div>
            )}

            {!loading && !error && game && (
                <div>
                    <div className={`${styles.page} container py-4`}>
                        <h1 className={`card-title ${styles.gameTitle}`}>
                            {game.name}
                        </h1>

                        <div className="card mb-4">
                            <img
                                src={game.icon}
                                className={`card-img-top ${styles.gameImage}`}
                                alt={game.name}
                            />

                            <div className="card-body d-flex justify-content-between align-items-center">
                                <p className="mb-0">
                                    <strong>Year:</strong> {game.year}
                                </p>

                                {user?.role !== "blocked" && user !== null && (
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
                                    <span
                                        key={p}
                                        className="badge bg-secondary me-1"
                                    >
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
                                onChange={(e) =>
                                    setInputValue(e.target.value)
                                }
                                onKeyDown={(e) =>
                                    e.key === "Enter" && handleSearch()
                                }
                            />
                            <button
                                className="btn btn-warning"
                                onClick={handleSearch}
                            >
                                Search
                            </button>
                        </div>

                        <div className="table-responsive">
                            <table
                                className={`table table-hover ${styles.tableCustom}`}
                            >
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
                                                No approved records yet
                                            </td>
                                        </tr>
                                    )}

                                    {records.map((record, index) => (
                                        <tr
                                            key={record._id}
                                            style={{ cursor: "pointer" }}
                                            onClick={() =>
                                                navigate(
                                                    `/record/${record._id}`
                                                )
                                            }
                                        >
                                            <td>{index + 1}</td>
                                            <td>{record.userId?.name}</td>
                                            <td>{record.platform}</td>
                                            <td>{record.time}</td>
                                            <td>{record.version}</td>
                                            <td>
                                                {new Date(
                                                    record.dateUpload
                                                ).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <Footer />
                </div>
            )}

        </div>
    );
};