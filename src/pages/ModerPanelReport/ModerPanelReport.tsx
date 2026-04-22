import { useEffect, useState, Fragment, useRef } from "react";
import Loader from "../../components/Loader/Loader";
import styles from "../../components/styles.module.css";
import style from "./ModerPanelReport.module.css";
import axios from "axios";

const LIMIT = 10;

export const ModerPanelReport = () => {
  const apiUrl = "https://myapi0305-cua6cdb7ghdxgtfk.polandcentral-01.azurewebsites.net";
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterType, setFilterType] = useState<"all" | "checked" | "report">("all");
  const [openReportId, setOpenReportId] = useState<string | null>(null);
  const [heights, setHeights] = useState<{ [key: string]: number }>({});

  const currentUser = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") || "{}")
    : null;
  const token = localStorage.getItem("token");
  const currentUserId = currentUser?._id;

  const fetchReports = () => {
    setLoading(true);
    setError(null);

    const params: any = { page, limit: LIMIT, currentUserId };
    if (filterType !== "all") params.type = filterType;

    axios
      .get(`${apiUrl}/api/comments/reports`, { params })
      .then((res) => {
        const data = res.data.data || [];

        const filtered = data.filter(
          (r: any) => r.fromUserId?._id !== currentUserId
        );

        setReports(filtered);
        setTotalPages(res.data.pagination.pages || 1);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReports();
  }, [page, filterType]);

  const getEmbedUrl = (url: string) => {
    const match = url?.match(/^.*(?:youtu.be\/|v\/|watch\?v=|embed\/)([^#&?]*).*/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  const checkReport = (id: string) => {
    axios
      .patch(
        `${apiUrl}/api/comments/${id}`,
        { type: "checked" },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => fetchReports())
      .catch((err) => console.error(err));
  };

  const removeRecord = (recordId: string, commentId: string) => {
    axios
      .delete(`${apiUrl}/api/records/${recordId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .catch((err) => console.error(err));

    axios
      .patch(
        `${apiUrl}/api/comments/${commentId}`,
        { type: "checked" },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => fetchReports())
      .catch((err) => console.error(err));
  };

  const blockUser = (userId: string, recordId: string, commentId: string) => {
    axios
      .patch(
        `${apiUrl}/api/auth/update/?id=${userId}`,
        { role: "blocked" },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .catch((err) => console.error(err));

    removeRecord(recordId, commentId);
  };

  const contentRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const newHeights: { [key: string]: number } = {};
    reports.forEach((r) => {
      const el = contentRefs.current[r._id];
      if (el) newHeights[r._id] = el.scrollHeight;
    });
    setHeights(newHeights);
  }, [reports]);

  return (
    <div className={style.page}>
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
                        <td style={{ color: "#0d6efd" }}>{report.toRecordId?._id || "—"}</td>
                        <td>{new Date(report.dateUpload).toLocaleDateString()}</td>
                        <td>{report.type}</td>
                      </tr>

                      <tr>
                        <td colSpan={7} className="p-0">
                          <div
                            className={style.expandable}
                            style={{
                              maxHeight: openReportId === report._id ? heights[report._id] || 0 : 0,
                            }}
                          >
                            <div ref={(el: any) => (contentRefs.current[report._id] = el)} className="p-3 bg-secondary">
                              <h5>Record Information</h5>
                              <p><b>Game:</b> {report.gameId?.name}</p>
                              <p><b>Status:</b> {report.toRecordId?.status || "—"}</p>
                              <p><b>User:</b> {report.fromUserId?.name}</p>
                              <p><b>Platform:</b> {report.toRecordId?.platform || "—"}</p>
                              <p><b>Time:</b> {report.toRecordId?.time || "—"}</p>
                              <p><b>Version:</b> {report.toRecordId?.version || "—"}</p>
                              <p style={{ wordBreak: "break-word" }}><b>Text:</b> {report.text}</p>

                              {report.toRecordId?.urlVideo && (
                                <div className="ratio ratio-16x9 mb-3">
                                  <iframe src={getEmbedUrl(report.toRecordId.urlVideo)} allowFullScreen title="video" />
                                </div>
                              )}

                              <div className="d-flex gap-3 mb-3 flex-wrap">
                                {report.type !== "checked" && (
                                  <button className="btn btn-success" onClick={() => checkReport(report._id)}>Check</button>
                                )}
                                {report.toRecordId && report.type !== "checked" && (
                                  <button className="btn btn-warning" onClick={() => removeRecord(report.toRecordId._id, report._id)}>Remove Record</button>
                                )}
                                {report.toRecordId && (
                                  <button className="btn btn-danger" onClick={() => blockUser(report.toUserId._id, report.toRecordId._id, report._id)}>Block User</button>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
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