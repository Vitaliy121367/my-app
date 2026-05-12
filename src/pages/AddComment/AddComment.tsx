import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "../../components/Navbar/Navbar";
import { Footer } from "../../components/Footer/Footer";
import { useState, useEffect } from "react";
import styles from "../../components/styles.module.css";
import style from "./AddComment.module.css";
import axios from "axios";
import Loader from "../../components/Loader/Loader";

type CommentType = "comment" | "report";

export const AddComment = () => {
  const apiUrl="myfastrunsapi0305-hzekc5edahebbtca.polandcentral-01.azurewebsites.net";
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;

    const { gameId, recordId } = useParams<{ gameId: string; recordId: string }>();
    const navigate = useNavigate();

    const [bg] = useState<string | null>(user?.background || null);
    const [record, setRecord] = useState<any>(null);
    const [hover, setHover] = useState<number | null>(null);

    const [text, setText] = useState("");
    const [rating, setRating] = useState<number>(5);
    const [type, setType] = useState<CommentType>("comment");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRecord = async () => {
            if (!recordId) {
                setError("Record id missing");
                setLoading(false);
                return;
            }
            try {
                const res = await axios.get(`${apiUrl}/api/records/record/?id=${recordId}`);
                setRecord(res.data);
            } catch (err: any) {
                setError(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchRecord();
    }, [recordId]);

    useEffect(() => {
        if (type === "report") setRating(0);
        else if (rating === 0) setRating(5);
    }, [type]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user?._id) {
            alert("You must be logged in");
            navigate("/login");
            return;
        }

        if (!record) {
            alert("Record is still loading");
            return;
        }

        if (!text.trim()) {
            alert("Enter comment text");
            return;
        }

        const comment = {
            gameId,
            fromUserId: user._id,
            toUserId: record.userId._id,
            toRecordId: recordId,
            text,
            rating: type === "report" ? 0 : rating,
            type,
            dateUpload: new Date(),
        };

        try {
            if (user._id !== record.userId._id) {
                await axios.post(`${apiUrl}/api/comments`, comment, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
            else{
                alert("You cannot comment on your own record");
            }
            navigate(`/record/${recordId}`);
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

    return (
        <div
            style={{
                backgroundImage: `url(${bg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                minHeight: "100vh",
            }}
        >
            <Navbar />
            <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "73.3vh" }}>
                <h1 className={styles.title}>Add Comment</h1>

                <form className="container" style={{ maxWidth: "500px" }} onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className={`form-label ${styles.title}`}>Comment</label>
                        <textarea
                            className="form-control"
                            rows={4}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            required
                        />
                    </div>

                    {type === "comment" && (
                        <div className="mb-3">
                            <label className={`form-label ${styles.title}`}>Rating (1–5)</label>
                            <div style={{ fontSize: "28px", cursor: "pointer", userSelect: "none" }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span
                                        key={star}
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHover(star)}
                                        onMouseLeave={() => setHover(null)}
                                        style={{
                                            color: (hover ?? rating) >= star ? "#ffff07" : "#757679",
                                            transition: "color 0.15s",
                                        }}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="btn-group w-100 mt-3">
                        {(["comment", "report"] as CommentType[]).map((t) => (
                            <div key={t}>
                                <input type="radio" className="btn-check" id={t} checked={type === t} onChange={() => setType(t)} />
                                <label className={`btn btn-outline-${t === "comment" ? "success" : "danger"}`} htmlFor={t}>
                                    {t}
                                </label>
                            </div>
                        ))}
                    </div>

                    <button type="submit" className="btn btn-primary mt-4 w-100" disabled={!record}>
                        Submit
                    </button>
                </form>
            </div>
            <Footer />
        </div>
    );
};