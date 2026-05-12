import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "../../components/Navbar/Navbar";
import { Footer } from "../../components/Footer/Footer";
import { useState, useEffect } from "react";
import styles from "../../components/styles.module.css";
import style from "./AddRecord.module.css";
import axios from "axios";

type Platform = "PC" | "Console" | "Phone";

export const AddRecord = () => {
    const apiUrl = "myfastrunsapi0305-hzekc5edahebbtca.polandcentral-01.azurewebsites.net";
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user") || "{}")
        : null;

    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [bg] = useState<string | null>(user ? user.background : null);
    const [game, setGame] = useState<any>(null);

    const [time, setTime] = useState({ hours: "", minutes: "", seconds: "" });
    const [platform, setPlatform] = useState<Platform | null>(null);
    const [urlVideo, setUrlVideo] = useState("");
    const [version, setVersion] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!id) return;

        setLoading(true);

        axios
            .get(`${apiUrl}/api/games/${id}`)
            .then(res => setGame(res.data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setErrorMessage(null);
        setTime({ ...time, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);

        if (!platform) {
            setErrorMessage("Select platform");
            return;
        }

        if (!game.platform.includes(platform)) {
            setErrorMessage(`This game does not support platform: ${platform}`);
            return;
        }

        if (!time.hours || !time.minutes || !time.seconds) {
            setErrorMessage("Enter full time");
            return;
        }

        if (!urlVideo.trim()) {
            setErrorMessage("Enter video link");
            return;
        }

        const formattedTime =
            `${time.hours.padStart(2, "0")}:` +
            `${time.minutes.padStart(2, "0")}:` +
            `${time.seconds.padStart(2, "0")}`;

        const record = {
            gameId: id,
            userId: user._id,
            platform,
            time: formattedTime,
            dateUpload: new Date(),
            version,
            urlVideo,
            status: "pending"
        };

        try {
            setIsSubmitting(true);

            await axios.post(`${apiUrl}/api/records`, record, {
                headers: { Authorization: `Bearer ${token}` }
            });

            navigate(`/games/${id}`);
        } catch (err: any) {
            setErrorMessage(err.response?.data?.message || err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (!user || user.role === "blocked") {
            navigate("/");
        }
    }, [user, navigate]);

    if (loading) return <div className="text-center py-5">Loading...</div>;
    if (error) return <div className="text-danger text-center py-5">{error}</div>;

    return (
        <div
            className={styles.page}
            style={{
                backgroundImage: `url(${bg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                minHeight: "100vh",
            }}
        >
            <Navbar />

            <div
                className="d-flex flex-column justify-content-center align-items-center"
                style={{ minHeight: "80vh" }}
            >
                <h1 className={styles.title}>AddRecord</h1>

                <form
                    className="container"
                    style={{ maxWidth: "500px" }}
                    onSubmit={handleSubmit}
                >
                    <div className="mb-3">
                        <label className={`form-label ${styles.title}`}>
                            Time address
                        </label>

                        <div className="d-flex gap-2">
                            <input
                                type="number"
                                name="hours"
                                className="form-control"
                                placeholder="HH"
                                min="0"
                                value={time.hours}
                                onChange={handleTimeChange}
                            />

                            <input
                                type="number"
                                name="minutes"
                                className="form-control"
                                placeholder="MM"
                                min="0"
                                max="59"
                                value={time.minutes}
                                onChange={handleTimeChange}
                            />

                            <input
                                type="number"
                                name="seconds"
                                className="form-control"
                                placeholder="SS"
                                min="0"
                                max="59"
                                value={time.seconds}
                                onChange={handleTimeChange}
                            />
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className={`form-label ${styles.title}`}>Link</label>

                        <input
                            type="url"
                            className="form-control"
                            placeholder="https://example.com"
                            value={urlVideo}
                            onChange={(e) => {
                                setErrorMessage(null);
                                setUrlVideo(e.target.value);
                            }}
                        />
                    </div>

                    <div className="mt-3 row">
                        {(["PC", "Console", "Phone"] as Platform[])
                            .filter(p => game.platform.includes(p))
                            .map(p => (
                                <div key={p} className="col">
                                    <input
                                        type="radio"
                                        className="btn-check"
                                        id={p}
                                        checked={platform === p}
                                        onChange={() => {
                                            setErrorMessage(null);
                                            setPlatform(p);
                                        }}
                                    />

                                    <label
                                        className={`btn btn-outline-${p === "PC"
                                            ? "success"
                                            : p === "Console"
                                                ? "warning"
                                                : "primary"
                                            }`}
                                        htmlFor={p}
                                    >
                                        {p}
                                    </label>
                                </div>
                            ))}
                    </div>

                    <div className="mb-3 mt-3">
                        <label className={`form-label ${styles.title}`}>
                            Version
                        </label>

                        <input
                            type="text"
                            className="form-control"
                            placeholder="1.0 / v1.2.3"
                            value={version}
                            onChange={(e) => {
                                setErrorMessage(null);
                                setVersion(e.target.value);
                            }}
                        />
                    </div>

                    {errorMessage && (
                        <div className="alert alert-danger text-center">
                            {errorMessage}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Submitting..." : "Submit"}
                    </button>
                </form>
            </div>

            <Footer />
        </div>
    );
};