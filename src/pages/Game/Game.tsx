import { NavLink, useNavigate, useParams } from "react-router-dom";
import { Navbar } from "../../components/Navbar/Navbar";
import { Footer } from "../../components/Footer/Footer";
import { useEffect, useRef, useState } from "react";
import Loader from "../../components/Loader/Loader";
import axios from "axios";
import styles from './Game.module.css';

export const Game = () => {
    const [game, setGame] = useState<any>(null);
    const [allRecords, setAllRecords] = useState<any[]>([]); // все записи
    const [records, setRecords] = useState<any[]>([]); // отображаемые после поиска
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [inputValue, setInputValue] = useState(""); // для инпута поиска
    const [search, setSearch] = useState(""); // фильтр по Enter

    const inputRef = useRef<HTMLInputElement>(null);

    const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") || "{}") : null;
    const [bg, setBg] = useState<any>(user?.background || null);

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
                const gameRes = await axios.get(`http://localhost:4000/api/games/${id}`);
                setGame(gameRes.data);

                const recordsRes = await axios.get(`http://localhost:4000/api/records/game/?id=${gameRes.data._id}`);
                const approvedRecords = recordsRes.data.filter((r: any) => r.status === "approved");

                const bestRecordsMap: { [key: string]: any } = {};
                approvedRecords.forEach((r: any) => {
                    const userId = r.userId?._id;
                    const platform = r.platform;
                    if (!userId || !platform) return;
                    const key = `${userId}_${platform}`;
                    if (!bestRecordsMap[key] || timeToSeconds(r.time) < timeToSeconds(bestRecordsMap[key].time)) {
                        bestRecordsMap[key] = r;
                    }
                });

                const bestRecords = Object.values(bestRecordsMap)
                    .sort((a, b) => timeToSeconds(a.time) - timeToSeconds(b.time));

                setAllRecords(bestRecords);
                setRecords(bestRecords); // показываем все записи до поиска
            } catch (err: any) {
                setError(err.message || "Error fetching data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            const filtered = allRecords.filter(r =>
                r.userId?.name.toLowerCase().includes(inputValue.toLowerCase())
            );
            setRecords(filtered);
            setSearch(inputValue); // можно использовать для других целей
        }
    };

    return (
        <div style={{
            backgroundImage: `url(${bg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            minHeight: "100vh"
        }}>
            <Navbar />
            {loading && <Loader />}
            {!loading && error && (
                <div className="text-danger text-center py-5">
                    Error: {error}
                </div>
            )}
            {!loading && !error && game && (
                <div className={`${styles.page} container py-4`}>
                    <h1 className={`card-title ${styles.gameTitle}`}>{game.name}</h1>
                    <div key={game._id} className="col-sm-12 col-md-12 col-lg-12">
                        <div className="card">
                            <img
                                src={game.icon}
                                className={`card-img-top ${styles.gameImage}`}
                                alt={game.name}
                            />
                            <div className="card-body">
                                <div className="row align-items-center">
                                    <div className="col-md-3">
                                        <p className="card-text mb-0">
                                            <strong>Year:</strong> {game.year}
                                        </p>
                                    </div>
                                    <div className="col-md-7"></div>
                                    <div className="col-md-2">
                                        {user?.role !== "blocked" && (
                                            <NavLink
                                                to={`/addrecord/${game._id}`}
                                                className="btn btn-primary"
                                            >
                                                Add Record
                                            </NavLink>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="card-body">
                                {game.platform.map((p: string) => (
                                    <span key={p} className="badge bg-secondary me-1">{p}</span>
                                ))}
                            </div>
                        </div>

                    </div>
                    <div className="d-flex gap-2 mt-4">
                        <input
                            ref={inputRef}
                            type="text"
                            className="form-control"
                            placeholder="Search user..."
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            autoFocus
                        />
                        <button
                            className="btn btn-warning"
                            onClick={() => {
                                const filtered = allRecords.filter(r =>
                                    r.userId?.name.toLowerCase().includes(inputValue.toLowerCase())
                                );
                                setRecords(filtered);
                                setSearch(inputValue);
                            }}
                        >
                            Search
                        </button>
                    </div>

                    <div className="row g-4 mt-2">
                        <div className="table-responsive">
                            <table className={`table table-hover ${styles.tableCustom}`}>
                                <thead>
                                    <tr>
                                        <th>Number</th>
                                        <th>User Name</th>
                                        <th>Platform</th>
                                        <th>Time</th>
                                        <th>Version</th>
                                        <th>Date Upload</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.map((record: any, index: number) => (
                                        <tr key={record._id} onClick={() => navigate(`/record/${record._id}`)}>
                                            <td>{index + 1}</td>
                                            <td>{record.userId?.name}</td>
                                            <td>{record.platform}</td>
                                            <td>{record.time}</td>
                                            <td>{record.version}</td>
                                            <td>{new Date(record.dateUpload).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
            <Footer />
        </div>
    );
};