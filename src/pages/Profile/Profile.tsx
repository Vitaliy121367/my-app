import { NavLink } from "react-router-dom";
import { Navbar } from "../../components/Navbar/Navbar";
import { Footer } from "../../components/Footer/Footer";
import { useEffect, useState } from "react";
import axios from "axios";
import style from "./Profile.module.css";
import Loader from "../../components/Loader/Loader";

export const Profile = () => {
    const [user, setUser] = useState<any>(null);
    const [records, setRecords] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const [statusFilter, setStatusFilter] =
        useState<"all" | "approved" | "pending">("all");

    const [bg, setBg] = useState<any>(
        localStorage.getItem("user")
            ? JSON.parse(localStorage.getItem("user") || "{}").background
            : null
    );

    useEffect(() => {
        let isMounted = true;

        const fetchUser = async () => {
            try {
                const token = localStorage.getItem("token");

                const resUser = await axios.get(
                    "http://localhost:4000/api/auth/me",
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (!isMounted) return;

                localStorage.setItem("user", JSON.stringify(resUser.data));
                setUser(resUser.data);

                const resRecords = await axios
                    .get(
                        "http://localhost:4000/api/records/user/?id=" +
                        resUser.data._id
                    )
                    .catch(err => {
                        if (err.response?.status === 404)
                            return { data: [] };
                        throw err;
                    });

                if (!isMounted) return;

                setRecords(resRecords.data || []);
                setLoading(false);
            } catch (err: any) {
                setError(err.response?.data?.message || err.message);
                setLoading(false);
            }
        };

        fetchUser();
        return () => {
            isMounted = false;
        };
    }, []);

    const filteredRecords =
        statusFilter === "all"
            ? records
            : records?.filter(
                (record: any) => record.status === statusFilter
            );

    const getEmbedUrl = (url: string) => {
        const regExp =
            /^.*(?:youtu.be\/|v\/|watch\?v=|embed\/)([^#&?]*).*/;
        const match = url.match(regExp);
        return match
            ? `https://www.youtube.com/embed/${match[1]}`
            : url;
    };

    return (
        <div
            className={style.page}
            style={{
                backgroundImage: `url(${bg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
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

            {!loading && !error && user && (
                <div className={style.content}>
                    <h2 className={style.title}>Profile</h2>

                    <div className="container-fluid py-4">
                        <div className="row">
                            <div className="col-lg-2"></div>

                            <div className="col-lg-8">
                                <div className="profile-header p-4 mb-4 d-flex align-items-center">
                                    <img
                                        src={
                                            user.icon ||
                                            "https://cdn-icons-png.freepik.com/256/12225/12225881.png"
                                        }
                                        className="rounded-circle me-3"
                                        width="80"
                                        height="80"
                                        alt="Avatar"
                                    />

                                    <div>
                                        <h2 className="mb-1 text-danger">
                                            {user.name}
                                        </h2>
                                        <h6 className="text-danger">
                                            {user.country}
                                        </h6>
                                        <h6 className="text-danger">
                                            {user.role}
                                        </h6>
                                    </div>
                                    {
                                        user.role !== "blocked" && (
                                            <>
                                                <div className="col-9"></div>
                                                {
                                                    user.role === "moderator" && (
                                                        <div className="col-1">
                                                            <NavLink
                                                                to="/profile/ModerPanel"
                                                                className="btn btn-outline-primary"
                                                            >
                                                                Moder Panel
                                                            </NavLink>
                                                        </div>
                                                    )
                                                }

                                                {
                                                    user.role === "user" && (
                                                        <div className="col-1"></div>
                                                    )
                                                }
                                                <div className="col-1">
                                                    <NavLink
                                                        to="/settings"
                                                        className="btn btn-outline-primary"
                                                    >
                                                        Settings
                                                    </NavLink>
                                                </div>
                                            </>
                                        )
                                    }
                                </div>

                                <div className="card card-dark p-4 mb-4">
                                    <h6 className="text-uppercase text-muted mb-3">
                                        Full Game Runs
                                    </h6>

                                    <div className="d-flex gap-2 mb-3">
                                        <button
                                            className={`btn btn-sm ${statusFilter === "all" ? "btn-primary" : "btn-outline-primary"
                                                }`}
                                            onClick={() => setStatusFilter("all")}
                                        >
                                            All
                                        </button>

                                        <button
                                            className={`btn btn-sm ${statusFilter === "approved"
                                                ? "btn-success"
                                                : "btn-outline-success"
                                                }`}
                                            onClick={() => setStatusFilter("approved")}
                                        >
                                            Approved
                                        </button>

                                        <button
                                            className={`btn btn-sm ${statusFilter === "pending"
                                                ? "btn-warning"
                                                : "btn-outline-warning"
                                                }`}
                                            onClick={() => setStatusFilter("pending")}
                                        >
                                            Pending
                                        </button>
                                    </div>

                                    {filteredRecords.length > 0 ? (
                                        <div className={style.runsGrid}>
                                            {filteredRecords.map(record => (
                                                <div
                                                    className={style.runCard}
                                                    key={record._id}
                                                >
                                                    <iframe
                                                        className={style.video}
                                                        src={getEmbedUrl(
                                                            record.urlVideo
                                                        )}
                                                        allowFullScreen
                                                        title="video"
                                                    />

                                                    <div className={style.cardBody}>
                                                        <h4>
                                                            {
                                                                record.gameId
                                                                    .name
                                                            }
                                                        </h4>
                                                        <h5>
                                                            Time: {record.time}
                                                        </h5>

                                                        <p>
                                                            Version:{" "}
                                                            {record.version}
                                                        </p>
                                                        <p>
                                                            Platform:{" "}
                                                            {record.platform}
                                                        </p>

                                                        <p>
                                                            Date Uploaded:{" "}
                                                            {new Date(
                                                                record.dateUpload
                                                            ).toLocaleDateString()}
                                                        </p>

                                                        <p
                                                            className={
                                                                style.status
                                                            }
                                                        >
                                                            Status:{" "}
                                                            {record.status}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-5">
                                            <h5 className="text-muted">
                                                NO RUNS
                                            </h5>
                                            <p className="text-secondary">
                                                No runs for this filter.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <Footer />
                </div>
            )}
        </div>
    );
};