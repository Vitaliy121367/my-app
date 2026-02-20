import { NavLink, Outlet, useNavigate, useParams } from "react-router-dom";
import { Navbar } from "../../components/Navbar/Navbar";
import { Footer } from "../../components/Footer/Footer";
import { useEffect, useRef, useState } from "react";
import Loader from "../../components/Loader/Loader";
import axios from "axios";
import styles from './Game.module.css';

export const Game = () => {
    const [game, setGame] = useState<any>(null);
    const [records, setRecords] = useState<any[]>([]);
    const [bg, setBg] = useState<any>(
        localStorage.getItem("user")
            ? JSON.parse(localStorage.getItem("user") || "{}").background
            : null
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const effectRan = useRef(false);
    const navigate = useNavigate();

    const { id } = useParams<{ id: string }>();

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            if (effectRan.current) return;
            effectRan.current = true;
            setLoading(true);
            try {
                const gameRes = await axios.get(`http://localhost:4000/api/games/${id}`);
                setGame(gameRes.data);

                const recordsRes = await axios.get(
                    `http://localhost:4000/api/records/game/?id=${gameRes.data._id}`
                );

                const sortedApprovedRecords = [...recordsRes.data]
                    .filter((r: any) => r.status === "approved")
                    .sort((a, b) => {
                        if (a.time > b.time) return 1;
                        if (a.time < b.time) return -1;
                        return 0;
                    });

                setRecords(sortedApprovedRecords);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);



    return (
        <div style={{
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
                                        <NavLink
                                            to={`/addrecord/${game._id}`}
                                            className="btn btn-primary"
                                        >
                                            Add Record
                                        </NavLink>
                                    </div>
                                </div>
                            </div>

                            <div className="card-body">
                                {game.platform.map((p: string) => (
                                    <span key={p} className="badge bg-secondary me-1">
                                        {p}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="row g-4 mt-3">
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
                                        <tr
                                            key={record._id}
                                            onClick={() => navigate(`/record/${record._id}`)}
                                        >
                                            <td>{index + 1}</td>
                                            <td>{record.userId?.name ?? "Unknown"}</td>
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
                    </div>
                </div>
            )}
            <Footer />
        </div>
    )
}