import { useEffect, useState } from "react";
import { Footer } from "../../components/Footer/Footer";
import { Navbar } from "../../components/Navbar/Navbar";
import styles from "../../components/styles.module.css";
import style from "./ModerPanel.module.css";
import { ModerPanelReport } from "../ModerPanelReport/ModerPanelReport";
import { ModerPanelRecord } from "../ModerPanelRecord/ModerPanelRecord";
import { useNavigate } from "react-router-dom";

export const ModerPanel = () => {
    const currentUser = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user") || "{}")
        : null;
    
  const navigate = useNavigate();
    const [bg] = useState(currentUser ? currentUser.background : null);
    useEffect(() => {
        if (!currentUser || currentUser.role !== "moderator" && currentUser.role !== "admin") navigate("/");
    }, [currentUser, navigate]);
    return (
        <div
            className={styles.page}
            style={{
                backgroundImage: `url(${bg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <Navbar />

            <main className={styles.content}>
                <div className="accordion" id="moderAccordion">
                    <div className="accordion-item">
                        <h2 className="accordion-header">
                            <button
                                className={`accordion-button ${style.title}`}
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target="#collapseOne"
                                aria-expanded="true"
                                aria-controls="collapseOne"
                            >
                                Report
                            </button>
                        </h2>
                        <div
                            id="collapseOne"
                            className="accordion-collapse collapse show"
                            data-bs-parent="#moderAccordion"
                        >
                            <div className={`accordion-body`}>
                                <ModerPanelReport />
                            </div>
                        </div>
                    </div>

                    <div className="accordion-item">
                        <h2 className="accordion-header">
                            <button
                                className={`accordion-button ${style.title}`}
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target="#collapseTwo"
                                aria-expanded="false"
                                aria-controls="collapseTwo"
                            >
                                Record
                            </button>
                        </h2>
                        <div
                            id="collapseTwo"
                            className="accordion-collapse collapse"
                            data-bs-parent="#moderAccordion"
                        >
                            <div className={`accordion-body   `}>
                                <ModerPanelRecord />
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};