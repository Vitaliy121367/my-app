import { useParams } from "react-router-dom";
import { Navbar } from "../../components/Navbar/Navbar";
import { Footer } from "../../components/Footer/Footer";
import { useEffect, useState } from "react";
import styles from "../../components/styles.module.css";
import style from "./Record.module.css";
import axios from "axios";
import Loader from "../../components/Loader/Loader";

export const Record = () => {
  const apiUrl="https://myapi0305-cua6cdb7ghdxgtfk.polandcentral-01.azurewebsites.net";
  const { id } = useParams<{ id: string }>();

  const [record, setRecord] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const [replyText, setReplyText] = useState("");
  const [rating, setRating] = useState(0);

  const [mode, setMode] = useState<"comment" | "report">("comment");
  const [reportText, setReportText] = useState("");
  const [formError, setFormError] = useState("");

  const [videoError, setVideoError] = useState(false);

  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") || "{}")
    : null;

  const token = localStorage.getItem("token");

  const canComment = !!user;

  // 🔥 ФУНКЦИЯ ДЛЯ ВИДЕО
  const getVideoData = (url: string) => {
    if (!url) return { type: "unknown", embedUrl: "" };

    // YouTube
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      let videoId = "";

      if (url.includes("watch?v=")) {
        videoId = url.split("watch?v=")[1].split("&")[0];
      } else if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1].split("?")[0];
      }

      return {
        type: "youtube",
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
      };
    }

    // Twitch
    if (url.includes("twitch.tv")) {
      if (url.includes("/videos/")) {
        const videoId = url.split("/videos/")[1];
        return {
          type: "twitch-video",
          embedUrl: `https://player.twitch.tv/?video=${videoId}&parent=localhost`,
        };
      }

      const channel = url.split("twitch.tv/")[1];
      return {
        type: "twitch-stream",
        embedUrl: `https://player.twitch.tv/?channel=${channel}&parent=localhost`,
      };
    }

    return { type: "unknown", embedUrl: url };
  };

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const recRes = await axios.get(
          `${apiUrl}/api/records/record?id=${id}`
        );

        setRecord(recRes.data);

        const commRes = await axios.get(
          `${apiUrl}/api/comments/comments`,
          { params: { toRecordId: id, page } }
        );

        setComments(commRes.data.comments || []);
        setPages(commRes.data.pages || 1);

      } catch (err: any) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, page]);

  const handleReply = async () => {
    if (!replyText.trim() || rating === 0) {
      setFormError("Fill all fields");
      return;
    }

    const res = await axios.post(
      `${apiUrl}/api/comments/create`,
      {
        text: replyText,
        toUserId: record.userId._id,
        toRecordId: id,
        gameId: record.gameId._id,
        type: "comment",
        rating,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setComments([res.data, ...comments]);
    setReplyText("");
    setRating(0);
    setFormError("Comment sent");
  };

  const handleReportRecord = async () => {
    if (!reportText.trim()) {
      setFormError("Write report text");
      return;
    }

    await axios.post(
      `${apiUrl}/api/comments/create`,
      {
        text: reportText,
        toUserId: record.userId._id,
        toRecordId: id,
        gameId: record.gameId._id,
        type: "report",
        rating: 0,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setReportText("");
    setFormError("Report sent");
  };

  if (loading) return <Loader />;
  if (error) return <div className="text-danger text-center">{error}</div>;

  const video = getVideoData(record?.urlVideo);

  return (
    <div
      style={{
        backgroundImage: record?.userId?.background
          ? `url(${record.userId.background})`
          : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
      }}
    >
      <Navbar />

      <div className="container py-3 py-md-4">

        <h1 className={styles.title}>Record</h1>

        <div className="profile-header p-3 p-md-4 mb-3 d-flex align-items-center">
          <img
            src={
              record.userId?.icon ||
              "https://cdn-icons-png.freepik.com/256/12225/12225881.png"
            }
            className="rounded-circle me-3"
            width="60"
            height="60"
          />
          <div>
            <h4 className="mb-1 text-danger">{record.userId?.name}</h4>
            <h6 className="text-danger">{record.userId?.country}</h6>
          </div>
        </div>

        {/* VIDEO */}
        <div className={`card ${style.body}`}>
          <div>Platform: {record.platform}</div>
          <div>Time: {record.time}</div>
          <div>Version: {record.version}</div>

          <div style={{ width: "100%" }}>
            {!videoError && video.type !== "unknown" ? (
              <iframe
                className={style.video}
                src={video.embedUrl}
                onError={() => setVideoError(true)}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <a href={record.urlVideo} target="_blank">
                Смотреть видео
              </a>
            )}
          </div>
        </div>

        <h2 className={`mt-4 ${styles.title}`}>Comments</h2>

        {canComment && (
          <div>
          <div className="d-flex flex-column flex-md-row mb-4 gap-2">
            <textarea
              className="form-control"
              style={{ minHeight: "60px" }}
              placeholder={
                mode === "comment"
                  ? "Add your comment..."
                  : "Describe the problem..."
              }
              value={mode === "comment" ? replyText : reportText}
              onChange={(e) =>
                mode === "comment"
                  ? setReplyText(e.target.value)
                  : setReportText(e.target.value)
              }
            />

            {mode === "comment" && (
              <div className="d-flex align-items-center gap-1">
                {[1, 2, 3, 4, 5].map((st) => (
                  <span
                    key={st}
                    onClick={() => setRating(st)}
                    style={{
                      cursor: "pointer",
                      color: st <= rating ? "#ffd556" : "#aaa",
                      fontSize: "clamp(18px, 4vw, 26px)",
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>
            )}

            <div className="d-flex flex-column gap-1">
              <button
                className="btn btn-primary btn-sm"
                onClick={() =>
                  mode === "comment" ? handleReply() : handleReportRecord()
                }
              >
                {mode === "comment" ? "Post Comment" : "Send Report"}
              </button>

              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() =>
                  setMode(mode === "comment" ? "report" : "comment")
                }
              >
                Switch
              </button>
            </div>
          </div>
            {formError && (
              <div className="alert alert-danger mt-3">{formError}</div>
            )}
          </div>
        )}

        {comments.map((c) => (
          <div key={c._id} className={`card mb-2 ${style.body}`}>
            <div className="card-body d-flex gap-2 flex-column flex-sm-row">
              <img
                src={
                  c.fromUserId?.icon ||
                  "https://cdn-icons-png.freepik.com/256/12225/12225881.png"
                }
                width="40"
                height="40"
                className="rounded-circle"
              />

              <div>
                <b>{c.fromUserId?.name}</b>

                <div>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      style={{
                        color: star <= c.rating ? "#ffd556" : "#ccc",
                        fontSize: "16px",
                      }}
                    >
                      ★
                    </span>
                  ))}
                </div>

                <p>{c.text}</p>
              </div>
            </div>
          </div>
        ))}

        {pages > 1 && (
          <div className="d-flex justify-content-center mt-4 gap-2 flex-wrap">
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`btn ${
                  p === page ? "btn-warning" : "btn-outline-warning"
                }`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};