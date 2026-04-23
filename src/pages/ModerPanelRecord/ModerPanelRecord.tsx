import { useEffect, useState, Fragment } from "react";
import Loader from "../../components/Loader/Loader";
import styles from "../../components/styles.module.css";
import style from "./ModerPanelRecord.module.css";
import axios from "axios";

const LIMIT = 10;

export const ModerPanelRecord = () => {
  const apiUrl = "https://myapi0305-cua6cdb7ghdxgtfk.polandcentral-01.azurewebsites.net";

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
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div className={style.page}>
      <main className={styles.content}>
        {loading && <Loader />}
        {!loading && error && <div className="text-danger text-center py-5">{error}</div>}

        {!loading && !error && (
          <div className="container py-3">

            {/* FILTERS */}
            <div className="d-flex gap-2 mb-3 flex-wrap">
              {["all", "pending", "approved", "rejected"].map(status => (
                <button
                  key={status}
                  className={`btn ${
                    filterStatus === status
                      ? "btn-info"
                      : "btn-outline-info"
                  }`}
                  onClick={() => {
                    setFilterStatus(status as any);
                    setPage(1);
                  }}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* DESKTOP TABLE */}
            <div className={style.desktopTable}>
              <div className={styles.table_responsive}>
                <table className="table table-dark table-striped">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Game</th>
                      <th>User</th>
                      <th>Platform</th>
                      <th>Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record, index) => (
                      <Fragment key={record._id}>
                        <tr onClick={() => setOpenRecordId(openRecordId === record._id ? null : record._id)}>
                          <td>{(page - 1) * LIMIT + index + 1}</td>
                          <td>{record.gameId?.name}</td>
                          <td>{record.userId?.name}</td>
                          <td>{record.platform}</td>
                          <td>{record.time}</td>
                          <td>{record.status}</td>
                        </tr>

                        {openRecordId === record._id && (
                          <tr>
                            <td colSpan={6}>
                              {record.urlVideo && (
                                <div className="ratio ratio-16x9">
                                  <iframe src={getEmbedUrl(record.urlVideo)} allowFullScreen />
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MOBILE CARDS */}
            <div className={style.mobileCards}>
              {records.map(record => (
                <div key={record._id} className="card bg-dark text-light p-2">
                  <div><b>Game:</b> {record.gameId?.name}</div>
                  <div><b>User:</b> {record.userId?.name}</div>
                  <div><b>Time:</b> {record.time}</div>
                  <div><b>Status:</b> {record.status}</div>

                  {record.urlVideo && (
                    <div className="ratio ratio-16x9 mt-2">
                      <iframe src={getEmbedUrl(record.urlVideo)} allowFullScreen />
                    </div>
                  )}

                  <div className="d-flex gap-2 mt-2">
                    <button className="btn btn-success" onClick={() => approveRecord(record._id)}>✔</button>
                    <button className="btn btn-warning" onClick={() => rejectedRecord(record._id)}>✖</button>
                    <button className="btn btn-danger" onClick={() => deleteRecord(record._id)}>🗑</button>
                  </div>
                </div>
              ))}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-center mt-3 gap-1 flex-wrap">
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