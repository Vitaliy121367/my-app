import { useParams } from "react-router-dom";
import { Navbar } from "../../components/Navbar/Navbar";
import { Footer } from "../../components/Footer/Footer";
import { useEffect, useState } from "react";
import styles from "./Record.module.css";
import axios from "axios";
import Loader from "../../components/Loader/Loader";

type Platform = "PC" | "Console" | "Phone";

interface Comment {
  _id: string;
  text: string;
  rating: number;
  type: "comment" | "report";
  fromUserId: { _id: string; name: string; icon?: string };
  toCommentId?: string | null;
}

export const Record = () => {
  const { id } = useParams<{ id: string }>();
  const [record, setRecord] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [replyText, setReplyText] = useState<string>("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<{ [key: string]: boolean }>({});
  const [rating, setRating] = useState<number>(0);

  const [reportText, setReportText] = useState<string>("");

  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") || "{}")
    : null;
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const recRes = await axios.get(`http://localhost:4000/api/records/record?id=${id}`);
        setRecord(recRes.data);

        const commRes = await axios.get(`http://localhost:4000/api/comments/comments?toRecordId=${id}`);
        setComments(commRes.data);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !user) return;

    const gameId = record.gameId?._id || null;
    const ratingValue = rating < 1 ? 1 : rating;

    const newComment = {
      text: replyText,
      fromUserId: user._id,
      toUserId: record.userId._id,
      toCommentId: replyTo,
      toRecordId: id,
      gameId,
      type: "comment",
      rating: ratingValue,
    };

    try {
      const res = await axios.post("http://localhost:4000/api/comments/create", newComment, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments([...comments, res.data]);
      setReplyText("");
      setReplyTo(null);
      setRating(0);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleReportRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportText.trim() || !user) return;

    const gameId = record.gameId?._id || null;

    const reportComment = {
      text: reportText,
      fromUserId: user._id,
      toUserId: record.userId._id,
      toCommentId: null,
      toRecordId: id,
      gameId,
      type: "report",
      rating: 0,
    };

    try {
      const res = await axios.post("http://localhost:4000/api/comments/create", reportComment, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments([...comments, res.data]);
      setReportText("");
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  if (loading) return <Loader />;
  if (error)
    return (
      <>
        <Navbar />
        <div className="text-danger text-center py-5">{error}</div>
        <Footer />
      </>
    );
  if (!record) return null;

  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    const regExp = /^.*(?:youtu.be\/|v\/|watch\?v=|embed\/)([^#&?]*).*/;
    const match = url.match(regExp);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  const renderStars = (value: number) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={i < value ? "text-warning" : "text-muted"}>
        ★
      </span>
    ));
  };

  const renderComments = (parentId: string | null = null, level = 0) => {
    return comments
      .filter(c => (c.toCommentId || null) === parentId)
      .map(c => {
        const replies = comments.filter(r => r.toCommentId === c._id);
        const isCollapsed = collapsed[c._id] ?? false;
        const isRecordOwner = user && user._id === record.userId._id;

        return (
          <div key={c._id} className="mb-2" style={{ marginLeft: level ? 40 : 0 }}>
            <div className={`card ${styles.body}`}>
              <div className="card-body d-flex align-items-start gap-2">
                <img
                  src={c.fromUserId.icon || "https://cdn-icons-png.freepik.com/256/12225/12225881.png?semt=ais_white_label"}
                  className="rounded-circle"
                  width="40"
                  height="40"
                  alt="User Icon"
                />
                <div>
                  <strong>{c.fromUserId.name}</strong>{" "}
                  {c.type === "comment" && <span className="ms-2">{renderStars(c.rating)}</span>}
                  {c.type === "report" && <span className="text-danger ms-2">(Reported)</span>}
                  <p className="mb-1">{c.text}</p>
                  <div className="d-flex gap-2">
                  </div>
                  {!isCollapsed && renderComments(c._id, level + 1)}
                </div>
              </div>
            </div>
          </div>
        );
      });
  };

  return (
    <div
      style={{
        backgroundImage: record.userId?.background ? `url(${record.userId.background})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
      }}
    >
      <Navbar />

      <div className="container py-4">
        <h1 className={`card-title ${styles.title}`}>Record</h1>
        <div className="profile-header p-4 mb-4 d-flex align-items-center">
          <img
            src={record.userId?.icon || "https://cdn-icons-png.freepik.com/256/12225/12225881.png?semt=ais_white_label"}
            className="rounded-circle me-3"
            width="80"
            height="80"
            alt="Avatar"
          />
          <div>
            <h2 className="mb-1 text-danger">{record.userId?.name}</h2>
            <h6 className="text-danger">{record.userId?.country}</h6>
          </div>
        </div>

        <div className={`card ${styles.body}`}>
          <div>Platform: {record.platform}</div>
          <div>Time: {record.time}</div>
          <div>Version: {record.version}</div>
          <div>Date Upload: {new Date(record.dateUpload).toLocaleDateString()}</div>
          <iframe
            loading="lazy"
            className={styles.video}
            src={getEmbedUrl(record.urlVideo)}
            title="YouTube video player"
            allowFullScreen
          />
        </div>

        <h2 className={`mt-4 ${styles.title}`}>Comments</h2>
        {user && user._id !== record.userId._id && (
          <div className="d-flex mb-4 align-items-start" style={{ gap: "10px", flexWrap: "wrap" }}>

            <textarea
              className="form-control"
              placeholder="Add comment or report..."
              value={replyText || reportText}
              onChange={e => {
                if (replyText !== undefined) setReplyText(e.target.value);
                if (reportText !== undefined) setReportText(e.target.value);
              }}
              style={{ flex: 1, minHeight: "60px" }}
              required
            />

            <div className={`${styles.title} d-flex align-items-center`} style={{ gap: "5px" }}>
              Rating:{" "}
              {[1, 2, 3, 4, 5].map(st => (
                <span
                  key={st}
                  style={{
                    color: st <= rating ? "#FFD966" : "#989595",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                  onClick={() => setRating(st < 1 ? 1 : st)}
                >
                  ★
                </span>
              ))}
            </div>

            <div className="d-flex flex-column gap-1">
              <button
                className="btn btn-primary btn-sm"
                onClick={handleReply}
              >
                Post Comment
              </button>
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={handleReportRecord}
              >
                Report
              </button>
            </div>
          </div>
        )}

        {renderComments()}
      </div>

      <Footer />
    </div>
  );
};