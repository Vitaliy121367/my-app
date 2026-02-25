import { NavLink, useParams } from "react-router-dom";
import { Navbar } from "../../components/Navbar/Navbar";
import { Footer } from "../../components/Footer/Footer";
import { useEffect, useState } from "react";
import styles from "./Record.module.css";
import axios from "axios";
import Loader from "../../components/Loader/Loader";

export const Record = () => {
  const { id } = useParams<{ id: string }>();
  const [record, setRecord] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const recRes = await axios.get(`http://localhost:4000/api/records/record?id=${id}`);
        const recordData = recRes.data;
        setRecord(recordData);

        const commRes = await axios.get(
          `http://localhost:4000/api/comments/comments?gameId=${recordData.gameId._id}&userId=${recordData.userId._id}&toRecordId=${id}`
        );
        setComments(commRes.data);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    const regExp = /^.*(?:youtu.be\/|v\/|watch\?v=|embed\/)([^#&?]*).*/;
    const match = url.match(regExp);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
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

        <h2 className={`card-title ${styles.title} mt-4`}>Comments</h2>
        <div className="row g-4 mb-3">
          <div className="col-10"></div>
          <div className="col-2">
            <NavLink
              to={`/addcomment/${record.gameId._id}/${record._id}`}
              className="btn btn-outline-warning"
            >
              Add Comment/Report
            </NavLink>
          </div>
        </div>

        <div className="row g-4">
          {comments.map((comment) => (
            <div key={comment._id} className="col-12">
              <div className={`card ${styles.body}`}>
                <div className="card-body row align-items-center">
                  <img
                    src={comment.fromUserId?.icon || "https://cdn-icons-png.freepik.com/256/12225/12225881.png?semt=ais_white_label"}
                    className="col-auto rounded-circle"
                    width="40"
                    height="40"
                    alt="User Icon"
                  />
                  <div className="col-auto">
                    <h5 className="mb-1">{comment.fromUserId?.name}</h5>
                    <div>
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} style={{ color: i < comment.rating ? "#FFD700" : "#ccc" }}>
                          &#9733;
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="col-12 mt-2">{comment.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};