import { Navbar } from "../../components/Navbar/Navbar";
import { Footer } from "../../components/Footer/Footer";
import Loader from "../../components/Loader/Loader";
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
                const latestFiveApproved = res.data
                    .filter((record: any) => record.status === "approved")
                    .sort(
                        (a: any, b: any) =>
                            new Date(b.dateUpload).getTime() -
                            new Date(a.dateUpload).getTime()
                    )
                    .slice(0, 5);

                setLastLoaded(latestFiveApproved);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const getEmbedUrl = (url: string) => {
        if (!url) return "";
        const regExp = /^.*(?:youtu.be\/|v\/|watch\?v=|embed\/)([^#&?]*).*/;
        const match = url.match(regExp);
        return match ? `https://www.youtube.com/embed/${match[1]}` : url;
    };

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

                {!loading && !error && lastLoaded.length === 0 && (
                    <div className="text-center py-5">
                        No approved records found.
                    </div>
                )}

                {!loading && !error && lastLoaded.length > 0 && (
                    <div className="p-4 mb-4">
                        <h6 className={`${style.title} mb-4`}>Last Loaded</h6>
                        <div className={style.runsGrid}>
                            {lastLoaded.map((record: any) => (
                                <div className={style.runCard} key={record._id}>
                                    {record.urlVideo ? (
                                        <iframe
                                            className={style.video}
                                            src={getEmbedUrl(record.urlVideo)}
                                            title="YouTube video player"
                                            allowFullScreen
                                        />
                                    ) : (
                                        <div className="text-center p-3 text-muted">
                                            No video
                                        </div>
                                    )}

                                    <div className={style.cardBody}>
                                        <h4>{record.gameId?.name || "Unknown Game"}</h4>
                                        <h5>Time: {record.time || "00:00:00"}</h5>
                                        <h5>User: {record.userId?.name || "Unknown User"}</h5>
                                        <p>Version: {record.version || "-"}</p>
                                        <p>Platform: {record.platform || "-"}</p>
                                        <p>
                                            Date Uploaded:{" "}
                                            {record.dateUpload
                                                ? new Date(record.dateUpload).toLocaleDateString()
                                                : "-"}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};