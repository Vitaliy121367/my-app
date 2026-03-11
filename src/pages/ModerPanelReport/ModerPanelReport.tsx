import { useEffect, useState, Fragment } from "react";
import Loader from "../../components/Loader/Loader";
import styles from "./ModerPanelReport.module.css";
import axios from "axios";

const LIMIT = 10;

export const ModerPanelReport = () => {
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
          type: filterType !== "all" ? filterType : undefined,
          currentUserId: currentUser?._id, 
        },
      })
      .then((res) => {
        setReports(res.data.data || []);
        setTotalPages(res.data.pagination.pages || 1);

        res.data.rejectedReports?.forEach((r: any) => {
          axios.delete(`http://localhost:4000/api/comments/${r._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(err => console.error(err));
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page, filterType]);

  const getEmbedUrl = (url: string) => {
    const match = url?.match(/^.*(?:youtu.be\/|v\/|watch\?v=|embed\/)([^#&?]*).*/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  const checkReport = (id: string) => {
    axios.patch(
      `http://localhost:4000/api/comments/${id}`,
      { type: "checked" },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    .then(() => setReports(prev => prev.map(r => r._id === id ? { ...r, type: "checked" } : r)))
    .catch(err => console.error(err));
  };

  const removeRecord = (recordId: string, commentId: string) => {
    axios.delete(`http://localhost:4000/api/records/${recordId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).catch(err => console.error(err));

    axios.patch(
      `http://localhost:4000/api/comments/${commentId}`,
      { type: "checked" },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    .then(() => setReports(prev => prev.map(r => r._id === commentId ? { ...r, type: "checked" } : r)))
    .catch(err => console.error(err));
  };

  const blockUser = (userId: string, recordId: string, commentId: string) => {
    axios.patch(`http://localhost:4000/api/auth/update/?id=${userId}`, { role: "blocked" }, {
      headers: { Authorization: `Bearer ${token}` },
    }).catch(err => console.error(err));

    removeRecord(recordId, commentId);
  };

  return (
    <div
      className={styles.page_container}
      style={{ backgroundImage: `url(${bg})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <main className={styles.content}>
        {loading && <Loader />}
        {!loading && error && <div className="text-danger text-center py-5">{error}</div>}

        {!loading && !error && (
          <div className="container py-4">
            <div className="d-flex gap-3 mb-3 flex-wrap">
              <button
                className={`btn ${filterType === "all" ? "btn-info" : "btn-outline-info"}`}
                onClick={() => { setFilterType("all"); setPage(1); }}
              >
                All
              </button>
              <button
                className={`btn ${filterType === "report" ? "btn-danger" : "btn-outline-danger"}`}
                onClick={() => { setFilterType("report"); setPage(1); }}
              >
                Report
              </button>
              <button
                className={`btn ${filterType === "checked" ? "btn-success" : "btn-outline-success"}`}
                onClick={() => { setFilterType("checked"); setPage(1); }}
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
                  {reports.map((report, index) => (
                    <Fragment key={report._id}>
                      <tr
                        style={{ cursor: "pointer" }}
                        onClick={() => setOpenReportId(openReportId === report._id ? null : report._id)}
                      >
                        <td>{(page - 1) * LIMIT + index + 1}</td>
                        <td>{report.gameId?.name}</td>
                        <td>{report.fromUserId?.name}</td>
                        <td>{report.toUserId?.name}</td>
                        <td style={{ cursor: "pointer", color: "#0d6efd" }}>{report.toRecordId?._id}</td>
                        <td>{new Date(report.dateUpload).toLocaleDateString()}</td>
                        <td>{report.type}</td>
                      </tr>

                      {openReportId === report._id && report.toRecordId && (
                        <tr>
                          <td colSpan={7} className="bg-secondary">
                            <div className="p-3">
                              <h5>Record Information</h5>
                              <p><b>Game:</b> {report.gameId?.name}</p>
                              <p><b>Status:</b> {report.toRecordId?.status}</p>
                              <p><b>User:</b> {report.fromUserId?.name}</p>
                              <p><b>Platform:</b> {report.toRecordId?.platform}</p>
                              <p><b>Time:</b> {report.toRecordId?.time}</p>
                              <p><b>Version:</b> {report.toRecordId?.version}</p>
                              <p style={{ wordBreak: "break-word" }}><b>Text:</b> {report.text}</p>

                              {report.toRecordId.urlVideo && (
                                <div className="ratio ratio-16x9">
                                  <iframe src={getEmbedUrl(report.toRecordId.urlVideo)} allowFullScreen title="video" />
                                </div>
                              )}

                              <div className="d-flex gap-3 mb-3 flex-wrap">
                                {report.type !== "checked" && (
                                  <button className="btn btn-success" onClick={() => checkReport(report._id)}>Check</button>
                                )}
                                {report.type !== "checked" && (
                                  <button className="btn btn-warning" onClick={() => removeRecord(report.toRecordId._id, report._id)}>Remove Record</button>
                                )}
                                <button className="btn btn-danger" onClick={() => blockUser(report.toUserId._id, report.toRecordId._id, report._id)}>Block User</button>
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