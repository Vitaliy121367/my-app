import { Outlet } from "react-router-dom";
import { Navbar } from "../../components/Navbar/Navbar";
import { Footer } from "../../components/Footer/Footer";
import { useState } from "react";
import Loader from "../../components/Loader/Loader";

export const Game = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [bg, setBg] = useState<any>(localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") || "{}")["background"] : null);
    
    
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
            <h2>Game</h2>
            )}
            <Footer />
        </div>
    )
}