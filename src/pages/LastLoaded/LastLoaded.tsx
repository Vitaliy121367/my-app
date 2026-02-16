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
    <div
        className={style.page}
        style={{
            backgroundImage: `url(${bg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
        }}
    >
        <Navbar />

        <main className={style.content}>
            {loading && <Loader />}

            {!loading && error && (
                <div className="text-danger text-center py-5">
                    Error: {error}
                </div>
            )}

            <div className="p-4 mb-4">
                <h6 className={`${style.title} mb-4`}>
                    Last Loaded
                </h6>

                {!loading && !error && (
                    <div className={style.runsGrid}>
                        {lastLoaded.map((record: any) => {
                            const getEmbedUrl = (url: string) => {
                                const regExp =
                                    /^.*(?:youtu.be\/|v\/|watch\?v=|embed\/)([^#&?]*).*/;
                                const match = url.match(regExp);
                                return match
                                    ? `https://www.youtube.com/embed/${match[1]}`
                                    : url;
                            };
                            if(record.status=="pending"){
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
                                        <h5>User: {record.userId.name}</h5>

                                        <p>Version: {record.version}</p>
                                        <p>Platform: {record.platform}</p>
                                        <p>
                                            Date Uploaded:{" "}
                                            {new Date(
                                                record.dateUpload
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            );
                            }
                        })}
                    </div>
                )}
            </div>
        </main>

        <Footer />
    </div>
)};