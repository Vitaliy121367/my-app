import { NavLink, Outlet } from "react-router-dom";
import { Navbar } from "../../components/Navbar/Navbar";
import { Footer } from "../../components/Footer/Footer";
import { useEffect, useState } from "react";
import axios from "axios";
import style from "./Profile.module.css";
import Loader from "../../components/Loader/Loader";

export const Profile = () => {
    const [user, setUser] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [records, setRecords] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [bg, setBg] = useState<any>(localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") || "{}")["background"] : null);

    useEffect(() => {
        let isMounted = true;

        const fetchUser = async () => {
            try {
                const token = localStorage.getItem("token");
                const resUser = await axios.get("http://localhost:4000/api/auth/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!isMounted) return;
                const resRecords = await axios.get("http://localhost:4000/api/records/user/?id=" + resUser.data._id,)
                    .catch(err => {
                        if (err.response?.status === 404) return { data: [] };
                        else throw err;
                    });
                localStorage.setItem("user", JSON.stringify(resUser.data));
                setUser(resUser.data);
                if (!isMounted) return;
                setRecords(resRecords.data);
                setLoading(false);
            } catch (error: any) {
                setError(error.response.data.message);
            }
        };

        fetchUser();

        return () => { isMounted = false; };
    }, []);

    return (
        <div
            className={style.page}
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
                <div className={style.content}>
                    <h2 className={style.title}>Profile</h2>

                    <div className="container-fluid py-4">
                        <div className="row">
                            <div className="col-lg-2 d-none d-lg-block"></div>
                            <div className="col-lg-8">


                                <div className="profile-header p-4 mb-4 d-flex align-items-center">
                                    <img src={user.icon} className="rounded-circle me-3" width="80" height="80" alt="Avatar" />
                                    <div>
                                        <h2 className="mb-1 text-danger">{user.name}</h2>
                                        <h6 className="text-danger">{user.country}</h6>
                                        <h6 className="text-danger">{user.role}</h6>
                                    </div>

                                    <div className="ms-auto">
                                        <NavLink
                                            to="/settings"
                                            className="btn btn-outline-primary"
                                        >
                                            Settings
                                        </NavLink>
                                    </div>
                                </div>


                                <div className="card card-dark p-4 mb-4">
                                    <h6 className="text-uppercase text-muted mb-4">
                                        Full Game Runs
                                    </h6>

                                    {records && records.length > 0 ? (
                                        <div className={style.runsGrid}>
                                            {records.map((record: any) => {
                                                const getEmbedUrl = (url: string) => {
                                                    const regExp =
                                                        /^.*(?:youtu.be\/|v\/|watch\?v=|embed\/)([^#&?]*).*/;
                                                    const match = url.match(regExp);
                                                    return match
                                                        ? `https://www.youtube.com/embed/${match[1]}`
                                                        : url;
                                                };

                                                return (
                                                    <div className={style.runCard} key={record._id}>
                                                        <iframe
                                                            className={style.video}
                                                            src={getEmbedUrl(record.urlVideo)}
                                                            title="YouTube video player"
                                                            allowFullScreen
                                                        />

                                                        <div className={style.cardBody}>
                                                            <h4>{record.gameId.name}</h4>
                                                            <h5>Time: {record.time}</h5>

                                                            <p>Version: {record.version}</p>
                                                            <p>Platform: {record.platform}</p>
                                                            <p>
                                                                Date Uploaded:{" "}
                                                                {new Date(
                                                                    record.dateUpload
                                                                ).toLocaleDateString()}
                                                            </p>

                                                            <p className={style.status}>
                                                                Status: {record.status}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-5">
                                            <h5 className="text-muted">NO RUNS</h5>
                                            <p className="text-secondary">
                                                User doesn't have any runs yet.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
            <Footer />
                </div>)}

        </div>
    );
}
