import { Navbar } from "../../components/Navbar/Navbar";
import { Footer } from "../../components/Footer/Footer";
import { useState } from "react";
import styles from "../../components/styles.module.css";
import style from "./NotFoundPage.module.css";

export const NotFoundPage = () => {
    const [bg, setBg] = useState<any>(localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") || "{}")["background"] : null);
    return (
        <div className={styles.page}
            style={{
                backgroundImage: `url(${bg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                minHeight: "100vh"
            }}
        >
            <Navbar />
            <div className={styles.content}>
                <h1 className={styles.title}>Page Not Found</h1>
            </div>
            <Footer />
        </div>
    )
}