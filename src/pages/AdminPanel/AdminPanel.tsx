import { useEffect, useState } from "react";
import { Footer } from "../../components/Footer/Footer";
import { Navbar } from "../../components/Navbar/Navbar";
import styles from "./AdminPanel.module.css";
import { ModerPanelReport } from "../ModerPanelReport/ModerPanelReport";
import { ModerPanelRecord } from "../ModerPanelRecord/ModerPanelRecord";
import { useNavigate } from "react-router";
import { AdminPanelUser } from "../AdminPanelUser/AdminPanelUser";
import { AddGame } from "../AddGame/AddGame";

export const AdminPanel = () => {
    const currentUser = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user") || "{}")
        : null;
    
  const navigate = useNavigate();
    const [bg] = useState(currentUser ? currentUser.background : null);
    useEffect(() => {
        if (!currentUser || currentUser.role !== "admin") navigate("/");
    }, [currentUser, navigate]);
    return (
        <div
            className={styles.page_container}
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
                                className={`accordion-button ${styles.title}`}
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target="#collapseOne"
                                aria-expanded="true"
                                aria-controls="collapseOne"
                            >
                                Reports
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
                                className={`accordion-button ${styles.title}`}
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target="#collapseTwo"
                                aria-expanded="false"
                                aria-controls="collapseTwo"
                            >
                                Records
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

                    <div className="accordion-item">
                        <h2 className="accordion-header">
                            <button
                                className={`accordion-button ${styles.title}`}
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target="#collapseThree"
                                aria-expanded="false"
                                aria-controls="collapseThree"
                            >
                                Users
                            </button>
                        </h2>
                        <div
                            id="collapseThree"
                            className="accordion-collapse collapse"
                            data-bs-parent="#moderAccordion"
                        >
                            <div className={`accordion-body   `}>
                                <AdminPanelUser />
                            </div>
                        </div>
                    </div>

                    <div className="accordion-item">
                        <h2 className="accordion-header">
                            <button
                                className={`accordion-button ${styles.title}`}
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target="#collapseFore"
                                aria-expanded="false"
                                aria-controls="collapseFore"
                            >
                                AddGame
                            </button>
                        </h2>
                        <div
                            id="collapseFore"
                            className="accordion-collapse collapse"
                            data-bs-parent="#moderAccordion"
                        >
                            <div className={`accordion-body   `}>
                                <AddGame />
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};