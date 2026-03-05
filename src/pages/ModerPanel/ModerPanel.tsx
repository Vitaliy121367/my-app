import { useEffect, useState, Fragment } from "react";
import { Footer } from "../../components/Footer/Footer";
import Loader from "../../components/Loader/Loader";
import { Navbar } from "../../components/Navbar/Navbar";
import styles from "./ModerPanel.module.css";
import axios from "axios";

const LIMIT = 10;

export const ModerPanel = () => {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [filterType, setFilterType] = useState<"all" | "checked" | "report">("all");
    const [openReportId, setOpenReportId] = useState<string | null>(null);

    const currentUser = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user") || "{}")
        : null;
    const token = localStorage.getItem("token");
    const [bg] = useState(currentUser ? currentUser.background : null);

    useEffect(() => {
        setLoading(true);
        setError(null);

        axios
            .get("http://localhost:4000/api/comments/reports", {
                params: {
                    page,
                    limit: LIMIT,
                    type: filterType !== "all" ? filterType : undefined,
                },
            })
            .then((res) => {
                setReports(res.data.data || []);
                setTotalPages(res.data.pagination.pages || 1);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [page, filterType]);

    const getEmbedUrl = (url: string) => {
        const match = url?.match(/^.*(?:youtu.be\/|v\/|watch\?v=|embed\/)([^#&?]*).*/);
        return match ? `https://www.youtube.com/embed/${match[1]}` : url;
    };

    const { filteredReports, rejectedReports } = reports.reduce(
        (acc, r) => {
            const pass =
                r.toUserId?._id !== currentUser?._id &&
                r.fromUserId?._id !== currentUser?._id &&
                (r.toRecordId?.status === "approved" || r.type === "checked");

            if (pass) {
                acc.filteredReports.push(r);
            } else {
                const exists = acc.rejectedReports.some((x: any) => x._id === r._id);
                if (!exists) {
                    acc.rejectedReports.push(r);
                }
            }

            return acc;
        },
        { filteredReports: [], rejectedReports: [] }
    );

    if (rejectedReports.length > 0) {
        for (let r of rejectedReports) {
            axios.delete(
                `http://localhost:4000/api/comments/${r._id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
        }
    }

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
                {loading && <Loader />}
                {!loading && error && (
                    <div className="text-danger text-center py-5">{error}</div>
                )}

                {!loading && !error && (
                    <div className="container py-4">
                        <h1 className={styles.title}>ModerPanel</h1>

                        <div className="d-flex gap-3 mb-3 flex-wrap">
                            <button
                                className={`btn ${filterType === "all" ? "btn-info" : "btn-outline-info"}`}
                                onClick={() => {
                                    setFilterType("all");
                                    setPage(1);
                                }}
                            >
                                All
                            </button>

                            <button
                                className={`btn ${filterType === "report" ? "btn-danger" : "btn-outline-danger"}`}
                                onClick={() => {
                                    setFilterType("report");
                                    setPage(1);
                                }}
                            >
                                Report
                            </button>

                            <button
                                className={`btn ${filterType === "checked" ? "btn-success" : "btn-outline-success"}`}
                                onClick={() => {
                                    setFilterType("checked");
                                    setPage(1);
                                }}
                            >
                                Checked
                            </button>
                        </div>

                        <div className={styles.table_responsive}>
                            <table className="table table-dark table-striped">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Game</th>
                                        <th>From User</th>
                                        <th>To User</th>
                                        <th>Record</th>
                                        <th>Date</th>
                                        <th>Type</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredReports.map((report: any, index: number) => (
                                        <Fragment key={report._id}>
                                            <tr>
                                                <td>{(page - 1) * LIMIT + index + 1}</td>
                                                <td>{report.gameId?.name}</td>
                                                <td>{report.fromUserId?.name}</td>
                                                <td>{report.toUserId?.name}</td>
                                                <td
                                                    style={{ cursor: "pointer", color: "#0d6efd" }}
                                                    onClick={() =>
                                                        setOpenReportId(openReportId === report._id ? null : report._id)
                                                    }
                                                >
                                                    {report.toRecordId?._id}
                                                </td>
                                                <td>{new Date(report.dateUpload).toLocaleDateString()}</td>
                                                <td>{report.type}</td>
                                            </tr>

                                            {openReportId === report._id && report.toRecordId && (
                                                <tr>
                                                    <td colSpan={7} className="bg-secondary">
                                                        <div
                                                            className="p-3"
                                                            style={{
                                                                maxWidth: "100%",
                                                                wordBreak: "break-word",
                                                                overflowX: "auto",
                                                                whiteSpace: "pre-wrap",
                                                            }}
                                                        >
                                                            <h5>Record Information</h5>
                                                            <p><b>Game:</b> {report.gameId?.name}</p>
                                                            <p><b>Status:</b> {report.toRecordId?.status}</p>
                                                            <p><b>User:</b> {report.fromUserId?.name}</p>
                                                            <p><b>Platform:</b> {report.toRecordId.platform}</p>
                                                            <p><b>Time:</b> {report.toRecordId.time}</p>
                                                            <p><b>Version:</b> {report.toRecordId.version}</p>
                                                            <p style={{ wordBreak: "break-word" }}><b>Text:</b> {report.text}</p>

                                                            {report.toRecordId.urlVideo && (
                                                                <div className="ratio ratio-16x9">
                                                                    <iframe
                                                                        src={getEmbedUrl(report.toRecordId.urlVideo)}
                                                                        allowFullScreen
                                                                        title="video"
                                                                    />
                                                                </div>
                                                            )}
                                                            {report.type === "checked" && (
                                                                <div className="d-flex gap-3 mb-3 flex-wrap">
                                                                    <button
                                                                        className="btn btn-danger"
                                                                        onClick={() => {
                                                                            axios.delete(
                                                                                `http://localhost:4000/api/records/${report.toRecordId._id}`,
                                                                                {
                                                                                    headers: {
                                                                                        Authorization: `Bearer ${token}`
                                                                                    }
                                                                                }
                                                                            );
                                                                        }}
                                                                    >
                                                                        Remove Checked
                                                                    </button>
                                                                </div>
                                                            )}

                                                            {report.type !== "checked" && (
                                                                <div className="d-flex gap-3 mb-3 flex-wrap">
                                                                    <button
                                                                        className="btn btn-success"
                                                                        onClick={() => {
                                                                            axios
                                                                                .patch(
                                                                                    `http://localhost:4000/api/comments/${report._id}`,
                                                                                    { type: "checked" },
                                                                                    {
                                                                                        headers: {
                                                                                            Authorization: `Bearer ${token}`
                                                                                        }
                                                                                    }
                                                                                )
                                                                                .then(() => {
                                                                                    setReports(prev =>
                                                                                        prev.map(r =>
                                                                                            r._id === report._id ? { ...r, type: "checked" } : r
                                                                                        )
                                                                                    );
                                                                                })
                                                                                .catch(err => {
                                                                                    console.error(err);
                                                                                });
                                                                        }}
                                                                    >
                                                                        Check
                                                                    </button>

                                                                    <button className="btn btn-warning"
                                                                        onClick={() => {
                                                                            axios.delete(
                                                                                `http://localhost:4000/api/records/${report.toRecordId._id}`,
                                                                                {
                                                                                    headers: {
                                                                                        Authorization: `Bearer ${token}`
                                                                                    }
                                                                                }
                                                                            )
                                                                            axios.patch(
                                                                                `http://localhost:4000/api/comments/${report._id}`,
                                                                                { type: "checked" },
                                                                                {
                                                                                    headers: {
                                                                                        Authorization: `Bearer ${token}`
                                                                                    }
                                                                                }
                                                                            )
                                                                                .then(() => {
                                                                                    setReports(prev =>
                                                                                        prev.map(r =>
                                                                                            r._id === report._id ? { ...r, type: "checked" } : r
                                                                                        )
                                                                                    );
                                                                                })
                                                                                .catch(err => {
                                                                                    console.error(err);
                                                                                });
                                                                        }}
                                                                    >
                                                                        Remove Record
                                                                    </button>
                                                                    <button className="btn btn-danger"
                                                                        onClick={() => {
                                                                            axios.patch(`http://localhost:4000/api/auth/update/?id=${report.toUserId._id}`,
                                                                                { role: "blocked" },
                                                                                {
                                                                                    headers: {
                                                                                        Authorization: `Bearer ${token}`
                                                                                    }
                                                                                }
                                                                            )
                                                                            axios.delete(
                                                                                `http://localhost:4000/api/records/${report.toRecordId._id}`,
                                                                                {
                                                                                    headers: {
                                                                                        Authorization: `Bearer ${token}`
                                                                                    }
                                                                                }
                                                                            )
                                                                            axios.patch(
                                                                                `http://localhost:4000/api/comments/${report._id}`,
                                                                                { type: "checked" },
                                                                                {
                                                                                    headers: {
                                                                                        Authorization: `Bearer ${token}`
                                                                                    }
                                                                                }
                                                                            )
                                                                                .then(() => {
                                                                                    setReports(prev =>
                                                                                        prev.map(r =>
                                                                                            r._id === report._id ? { ...r, type: "checked" } : r
                                                                                        )
                                                                                    );
                                                                                })
                                                                                .catch(err => {
                                                                                    console.error(err);
                                                                                });
                                                                        }}
                                                                    >
                                                                        Block User
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {totalPages > 1 && (
                            <div className="d-flex justify-content-center mt-4 gap-2 flex-wrap">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <button
                                        key={p}
                                        className={`btn ${page === p ? "btn-info" : "btn-outline-info"}`}
                                        onClick={() => setPage(p)}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};