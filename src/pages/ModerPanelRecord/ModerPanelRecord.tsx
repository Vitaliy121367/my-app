import { useEffect, useState, Fragment } from "react";
import Loader from "../../components/Loader/Loader";
import styles from "../../components/styles.module.css";
import style from "./ModerPanelRecord.module.css";
import axios from "axios";

const LIMIT = 10;

export const ModerPanelRecord = () => {
  const apiUrl="myfastrunsapi0305-hzekc5edahebbtca.polandcentral-01.azurewebsites.net";
    const [records, setRecords] = useState<RecordType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filterStatus, setFilterStatus] = useState<"all" | "approved" | "pending" | "rejected">("all");
    const [openRecordId, setOpenRecordId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currentUser = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user") || "{}")
        : null;
    const token = localStorage.getItem("token");

    useEffect(() => {
        setLoading(true);
        setError(null);

        axios
            .get(`${apiUrl}/api/records`, {
                params: {
                    page,
                    limit: LIMIT,
                    status: filterStatus !== "all" ? filterStatus : undefined,
                    excludeUserId: currentUser?._id,
                },
            })
            .then((res) => {
                setRecords(res.data.records || []);
                setTotalPages(res.data.pages || 1);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [page, filterStatus]);

    const getEmbedUrl = (url: string) => {
        const match = url?.match(/^.*(?:youtu.be\/|v\/|watch\?v=|embed\/)([^#&?]*).*/);
        return match ? `https://www.youtube.com/embed/${match[1]}` : url;
    };

    const deleteRecord = (id: string) => {
        setIsSubmitting(true);

        axios
            .delete(`${apiUrl}/api/records/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then(() => setRecords(prev => prev.filter(r => r._id !== id)))
            .catch(err => console.error(err))
            .finally(() => setIsSubmitting(false));
    };

    const approveRecord = (id: string) => {
        setIsSubmitting(true);

        axios
            .patch(`${apiUrl}/api/records/${id}`, { status: "approved" }, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then(() => {
                setRecords(prev => prev.map(r => r._id === id ? { ...r, status: "approved" } : r));
            })
            .catch(err => console.error(err))
            .finally(() => setIsSubmitting(false));
    };

    const rejectedRecord = (id: string) => {
        setIsSubmitting(true);

        axios
            .patch(`${apiUrl}/api/records/${id}`, { status: "rejected" }, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then(() => {
                setRecords(prev => prev.map(r => r._id === id ? { ...r, status: "rejected" } : r));
            })
            .catch(err => console.error(err))
            .finally(() => setIsSubmitting(false));
    };

    return (
        <div className={style.page}>
            <main className={styles.content}>
                {loading && <Loader />}
                {!loading && error && <div className="text-danger text-center py-5">{error}</div>}

                {!loading && !error && (
                    <div className="container py-4">

                        <div className="d-flex gap-3 mb-3 flex-wrap">
                            <button
                                className={`btn ${filterStatus === "all" ? "btn-info" : "btn-outline-info"}`}
                                onClick={() => { setFilterStatus("all"); setPage(1); }}
                            >
                                All
                            </button>
                            <button
                                className={`btn ${filterStatus === "pending" ? "btn-primary" : "btn-outline-primary"}`}
                                onClick={() => { setFilterStatus("pending"); setPage(1); }}
                            >
                                Pending
                            </button>
                            <button
                                className={`btn ${filterStatus === "approved" ? "btn-success" : "btn-outline-success"}`}
                                onClick={() => { setFilterStatus("approved"); setPage(1); }}
                            >
                                Approved
                            </button>
                            <button
                                className={`btn ${filterStatus === "rejected" ? "btn-warning" : "btn-outline-warning"}`}
                                onClick={() => { setFilterStatus("rejected"); setPage(1); }}
                            >
                                Rejected
                            </button>
                        </div>

                        <div className="table-responsive">
                            <table className="table table-dark table-striped">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Game</th>
                                        <th>User</th>
                                        <th>Platform</th>
                                        <th>Time</th>
                                        <th>Version</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.map((record, index) => (
                                        <Fragment key={record._id}>
                                            <tr
                                                style={{ cursor: "pointer" }}
                                                onClick={() => setOpenRecordId(openRecordId === record._id ? null : record._id)}
                                            >
                                                <td>{(page - 1) * LIMIT + index + 1}</td>
                                                <td>{record.gameId?.name}</td>
                                                <td>{record.userId?.name}</td>
                                                <td>{record.platform}</td>
                                                <td>{record.time}</td>
                                                <td>{record.version}</td>
                                                <td>{record.status}</td>
                                                <td>{new Date(record.dateUpload).toLocaleDateString()}</td>
                                            </tr>

                                            {openRecordId === record._id && (
                                                <tr>
                                                    <td colSpan={8} className="bg-secondary">
                                                        <div className="p-3">
                                                            <h5>Record Information</h5>

                                                            {record.urlVideo && (
                                                                <div className="ratio ratio-16x9">
                                                                    <iframe src={getEmbedUrl(record.urlVideo)} allowFullScreen title="video" />
                                                                </div>
                                                            )}

                                                            <div className="d-flex gap-3 mt-3">
                                                                {record.status !== "approved" && (
                                                                    <button
                                                                        className="btn btn-success"
                                                                        onClick={() => approveRecord(record._id)}
                                                                        disabled={isSubmitting}
                                                                    >
                                                                        {isSubmitting ? "Processing..." : "Approve"}
                                                                    </button>
                                                                )}

                                                                {record.status !== "approved" && record.status !== "rejected" && (
                                                                    <button
                                                                        className="btn btn-warning"
                                                                        onClick={() => rejectedRecord(record._id)}
                                                                        disabled={isSubmitting}
                                                                    >
                                                                        {isSubmitting ? "Processing..." : "Reject"}
                                                                    </button>
                                                                )}

                                                                <button
                                                                    className="btn btn-danger"
                                                                    onClick={() => deleteRecord(record._id)}
                                                                    disabled={isSubmitting}
                                                                >
                                                                    {isSubmitting ? "Processing..." : "Delete"}
                                                                </button>
                                                            </div>
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
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
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
        </div>
    );
};