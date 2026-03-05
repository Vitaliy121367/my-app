import { useEffect, useState } from "react";
import { Footer } from "../../components/Footer/Footer";
import Loader from "../../components/Loader/Loader";
import { Navbar } from "../../components/Navbar/Navbar";
import styles from "./ModerPanel.module.css";
import axios from "axios";

export const ModerPanel = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const currentUser = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user") || "{}")
        : null;
    const [bg, setBg] = useState<any>(
        currentUser
            ? currentUser.background
            : null
    );
    const [users, setUsers] = useState<any[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                setError(null);

                const userRes = await axios.get("http://localhost:4000/api/auth/");
                setUsers(userRes.data);
            } catch (err: any) {
                setError(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    return (
        <div
            className={styles.page}
            style={{
                backgroundImage: `url(${bg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                minHeight: "100vh"
            }}
        >
            <Navbar />

            {loading && <Loader />}
            {!loading && error && <div className="text-danger text-center py-5">{error}</div>}

            {!loading && !error && (
                <div>
                    <div className={`${styles.page} ${styles.content} container py-4`}>
                        <h1 className={styles.title}>ModerPanel</h1>
                        <table className="table table-dark table-striped">
                            <thead>
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">Icon</th>
                                    <th scope="col">Name</th>
                                    <th scope="col">Email</th>
                                    <th scope="col">Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users
                                    .filter(user => user._id !== currentUser?._id)
                                    .map((user, index) => (
                                        <tr key={user._id}>
                                            <th scope="row">{index + 1}</th>
                                            <td>
                                                <img
                                                    src={
                                                        user.icon ||
                                                        "https://cdn-icons-png.freepik.com/256/12225/12225881.png"
                                                    }
                                                    className="rounded-circle me-3"
                                                    width="80"
                                                    height="80"
                                                    alt="Avatar"
                                                />
                                            </td>
                                            <td>{user.name}</td>
                                            <td>{user.email}</td>
                                            <td>{user.role}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>

                    </div>

                    <Footer />
                </div>
            )}
        </div>
    );
};