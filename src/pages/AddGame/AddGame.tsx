import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import styles from "./AddGame.module.css";
import axios from "axios";

export const AddGame = () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user") || "{}")
        : null;

    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [year, setYear] = useState("");
    const [icon, setIcon] = useState("");
    const [platform, setPlatform] = useState<('Phone' | 'PC' | 'Console')[]>([]);

    const [error, setError] = useState<string | null>(null);

    const togglePlatform = (value: 'Phone' | 'PC' | 'Console') => {
        setPlatform((prev) =>
            prev.includes(value)
                ? prev.filter((p) => p !== value)
                : [...prev, value]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!name) {
            setError("Select name");
            return;
        }

        if (!year) {
            setError(`Select year`);
            return;
        }

        if (platform.length === 0) {
            setError("Select platforms");
            return;
        }

        const game = {
            name: name,
            year: year,
            icon: icon,
            platform: platform
        };

        try {
            await axios.post("http://localhost:4000/api/games", game, {
                headers: { Authorization: `Bearer ${token}` }
            });

            navigate(`/`);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
        }
    };

    return (
        <div
        style={{
                backgroundImage: `url(${user.bg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                minHeight: "100vh"
            }}>
            <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
                <h1 className={styles.title}>AddGame</h1>

                <form className="container" style={{ maxWidth: "500px" }} onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className={`form-label ${styles.title}`}>Game Name</label>
                        <input
                            type="text"
                            name="gameName"
                            className="form-control"
                            value={name}
                            onChange={(e) => { setName(e.target.value) }}
                        />
                    </div>

                    <div className="mb-3">
                        <label className={`form-label ${styles.title}`}>Year</label>
                        <input
                            type="number"
                            name="year"
                            className="form-control"
                            value={year}
                            min="1700"
                            max={new Date().getFullYear()}
                            step="1"
                            onChange={(e) => setYear(e.target.value)}
                        />
                    </div>

                    <div className="mb-3">
                        <label className={`form-label ${styles.title}`}>Link</label>

                        <input
                            type="url"
                            className="form-control"
                            placeholder="https://example.com"
                            value={icon}
                            onChange={(e) => {
                                setError(null);
                                setIcon(e.target.value);
                            }}
                        />
                    </div>

                    <div className="mb-3 row">
                        <label className={`form-label ${styles.title}`}>Platforms</label>

                        <div className="col">
                            <input
                                type="checkbox"
                                className="btn-check"
                                id="pc"
                                checked={platform.includes("PC")}
                                onChange={() => togglePlatform("PC")}
                            />
                            <label className="btn btn-outline-success" htmlFor="pc">
                                PC
                            </label>
                        </div>

                        <div className="col">
                            <input
                                type="checkbox"
                                className="btn-check"
                                id="console"
                                checked={platform.includes("Console")}
                                onChange={() => togglePlatform("Console")}
                            />
                            <label className="btn btn-outline-warning" htmlFor="console">
                                Console
                            </label>
                        </div>

                        <div className="col">
                            <input
                                type="checkbox"
                                className="btn-check"
                                id="phone"
                                checked={platform.includes("Phone")}
                                onChange={() => togglePlatform("Phone")}
                            />
                            <label className="btn btn-outline-primary" htmlFor="phone">
                                Phone
                            </label>
                        </div>
                    </div>

                    {error && (
                        <div className="alert alert-danger text-center">
                            {error}
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary mt-4 w-100">
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
};