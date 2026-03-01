import { useState } from "react";
import { Footer } from "../../components/Footer/Footer";
import Loader from "../../components/Loader/Loader";
import { Navbar } from "../../components/Navbar/Navbar";
import styles from "./ModerPanel.module.css";

export const ModerPanel = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [bg, setBg] = useState<any>(
        localStorage.getItem("user")
            ? JSON.parse(localStorage.getItem("user") || "{}").background
            : null
    );

    return (
        <div
            className={styles.page}
            style={{
                backgroundImage: `url(${bg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                minHeight: "100vh"
            }}
        >
            <Navbar />

            

            {!loading && !error && (
                <div className={`${styles.page} ${styles.content} container py-4`}>
                    <h1 className={styles.title}>ModerPanel</h1>
                </div>
            )}

            <Footer />
        </div>
    );
};