import { Outlet } from "react-router-dom";
import { Navbar } from "../../components/Navbar/Navbar";
import { Footer } from "../../components/Footer/Footer";
import { useState } from "react";
import styles from './Record.module.css';

export const Record = () => {
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
            <h1 className={styles.title}>Record</h1>
            <Footer />
        </div>
    )
}