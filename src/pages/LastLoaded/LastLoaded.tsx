import { Outlet } from "react-router-dom";
import { Navbar } from "../../components/Navbar/Navbar";
import Loader from "../../components/Loader/Loader";
import { Footer } from "../../components/Footer/Footer";
import { useEffect, useState } from "react";
import style from "./LastLoaded.module.css";
import axios from "axios";

export const LastLoaded = () => {
    const [lastLoaded, setLastLoaded] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const bg = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user") || "{}")?.background
        : null;

    useEffect(() => {
        axios.get("http://localhost:4000/api/records")
            .then(res => {
                const latestFive = res.data
                    .sort(
                        (a: any, b: any) =>
                            new Date(b.dateUpload).getTime() -
                            new Date(a.dateUpload).getTime()
                    )
                    .slice(0, 5);
                setLastLoaded(latestFive);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

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

            {!loading && !error && (
                <div className={style.content}>
                    <h2 className={style.title}>Last Loaded</h2>

                    <div className="container">
                        {lastLoaded.map(record => (
                            <div key={record._id}>
                                {record.gameId?.name} — {record.time}
                            </div>
                        ))}
                    </div>
                    <Footer />
                </div>
            )}

        </div>
    );
};
