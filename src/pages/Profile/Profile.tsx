import { Outlet } from "react-router-dom";
import { Navbar } from "../../components/Navbar/Navbar";
import { Footer } from "../../components/Footer/Footer";
import { useEffect, useState } from "react";
import axios from "axios";
import style from "./Profile.module.css";
import Loader from "../../components/Loader/Loader";

export const Profile = () => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(
                    "http://localhost:4000/api/auth/me",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setUser(res.data);
                setLoading(false);
            } catch (error) {
                console.error(error);
            }
        };
        fetchUser();
    }, []);


    if (loading) return <Loader />;
    if (user == null) {
        return (
            <div>
                <Navbar />
                <h2>No user data available</h2>
            </div>
        );
    }
    else {
        return (
            <div
                className={style.page}
                style={{
                    backgroundImage: `url(${user.background})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    minHeight: "100vh"
                }}
            >
                <Navbar />
                <div className={style.content}>
                    <h2 className={style.title}>Profile</h2>

                    <div className="container-fluid py-4">
                        <div className="row">
                            <div className="col-lg-2 d-none d-lg-block"></div>
                            <div className="col-lg-8">


                                <div className="profile-header p-4 mb-4 d-flex align-items-center">
                                    <img src={user.icon} className="rounded-circle me-3" width="80" height="80" alt="Avatar" />
                                    <div>
                                        <h3 className="mb-1 text-danger">{user.name}</h3>
                                        <h6 className="text-danger">{user.country}</h6>
                                        <h6 className="text-danger">{user.role}</h6>
                                    </div>

                                    <div className="ms-auto">
                                        <button className="btn btn-outline-info btn-sm">Settings</button>
                                    </div>
                                </div>


                                <div className="card card-dark p-4 mb-4">
                                    <h6 className="text-uppercase text-muted">Full Game Runs</h6>
                                    <div className="text-center py-5">
                                        <h5 className="text-muted">NO RUNS</h5>
                                        <p className="text-secondary">User doesn't have any runs yet.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Outlet />
                <Footer />
            </div>
        )
    }
}