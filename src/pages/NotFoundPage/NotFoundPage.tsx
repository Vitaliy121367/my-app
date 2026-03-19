import { Navbar } from "../../components/Navbar/Navbar";
import { Footer } from "../../components/Footer/Footer";
import { useState } from "react";
import style from "./NotFoundPage.module.css";

export const NotFoundPage = () => {
    const [bg, setBg] = useState<any>(localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") || "{}")["background"] : null);
    return (
        <div className={style.page}
            style={{
                backgroundImage: `url(${bg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                minHeight: "100vh"
            }}
        >
            <Navbar />
            <div className={style.content}>
                <h2 className={style.title}>Page Not Found</h2>
            </div>
            <Footer />
        </div>
    )
}