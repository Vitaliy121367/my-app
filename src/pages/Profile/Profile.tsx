import { NavLink } from "react-router-dom";
import { Navbar } from "../../components/Navbar/Navbar";
import { Footer } from "../../components/Footer/Footer";
import { useEffect, useState } from "react";
import axios from "axios";
import styles from "../../components/styles.module.css";
import style from "./Profile.module.css";
import Loader from "../../components/Loader/Loader";

export const Profile = () => {
  const apiUrl = "https://myapi0305-cua6cdb7ghdxgtfk.polandcentral-01.azurewebsites.net";

  const [user, setUser] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "pending">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bg = user?.background || "";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        if (!token) throw new Error("Not authorized");

        const { data: userData } = await axios.get(`${apiUrl}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(userData);

        const { data } = await axios.get(`${apiUrl}/api/records/user`, {
          params: {
            id: userData._id,
            page,
            status: statusFilter !== "all" ? statusFilter : undefined,
          },
        });

        setRecords(data.records || []);
        setPages(data.pages || 1);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, statusFilter]);

  const getEmbedUrl = (url: string) => {
    const regExp = /^.*(?:youtu.be\/|v\/|watch\?v=|embed\/)([^#&?]*).*/;
    const match = url.match(regExp);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  return (
    <div
      className={styles.page}
      style={{
        backgroundImage: `url(${bg})`,
      }}
    >
      <Navbar />

      <div className={styles.content}>
        {loading && <Loader />}

        {!loading && error && (
          <div className="text-danger text-center py-5">{error}</div>
        )}

        {!loading && !error && user && (
          <div className={style.wrapper}>
            <h2 className={styles.title}>Profile</h2>

            <div className={style.profileHeader}>
              <div className={style.userInfo}>
                <img
                  src={
                    user.icon ||
                    "https://cdn-icons-png.freepik.com/256/12225/12225881.png"
                  }
                  className={style.avatar}
                  alt="Avatar"
                />
                <div className={style.userText}>
                  <h2>{user.name}</h2>
                  <p>{user.country}</p>
                  <p>{user.role}</p>
                </div>
              </div>

              {user.role !== "blocked" && (
                <div className={style.actions}>
                  {user.role === "moderator" && (
                    <NavLink to="/profile/ModerPanel" className="btn btn-outline-primary">
                      Moder Panel
                    </NavLink>
                  )}

                  {user.role === "admin" && (
                    <NavLink to="/profile/AdminPanel" className="btn btn-outline-primary">
                      Admin Panel
                    </NavLink>
                  )}

                  <NavLink to="/settings" className="btn btn-outline-primary">
                    Settings
                  </NavLink>
                </div>
              )}
            </div>

            <div className={style.card}>
              <h6>FULL GAME RUNS</h6>

              <div className={style.filters}>
                {["all", "approved", "pending"].map((status) => (
                  <button
                    key={status}
                    className={`btn btn-sm ${
                      statusFilter === status
                        ? "btn-primary"
                        : "btn-outline-primary"
                    }`}
                    onClick={() => {
                      setStatusFilter(status as any);
                      setPage(1);
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>

              {records.length > 0 ? (
                <div className={style.runsGrid}>
                  {records.map((record) => (
                    <div className={style.runCard} key={record._id}>
                      {record.urlVideo && (
                        <iframe
                          src={getEmbedUrl(record.urlVideo)}
                          className={style.video}
                          allowFullScreen
                          title="video"
                        />
                      )}

                      <div className={style.cardBody}>
                        <h4>{record.gameId?.name}</h4>
                        <p>Time: {record.time}</p>
                        <p>Version: {record.version}</p>
                        <p>Platform: {record.platform}</p>
                        <p>
                          Date:{" "}
                          {new Date(record.dateUpload).toLocaleDateString()}
                        </p>
                        <p>Status: {record.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={style.empty}>
                  <h5>NO RUNS</h5>
                  <p>No runs for this filter</p>
                </div>
              )}

              {pages > 1 && (
                <div className={style.pagination}>
                  {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      className={`btn ${
                        page === p ? "btn-primary" : "btn-outline-primary"
                      }`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};