import { Outlet } from "react-router-dom";
import { Navbar } from "../../components/Navbar/Navbar";
import { Footer } from "../../components/Footer/Footer";
import { useEffect, useState } from "react";
import Loader from "../../components/Loader/Loader";
import axios from "axios";

export const News = () => {
    const [news, setNews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [bg, setBg] = useState<any>(localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") || "{}")["background"] : null);

    useEffect(() => {
        axios.get("http://localhost:4000/api/News")
            .then(res => setNews(res.data))
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
                <div>
                    <h2>News</h2>
                    <Footer />
                </div>
            )}
        </div>
    )
}