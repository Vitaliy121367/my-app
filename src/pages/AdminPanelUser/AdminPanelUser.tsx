import { useEffect, useState } from "react";
import Loader from "../../components/Loader/Loader";
import styles from "./AdminPanelUser.module.css";
import axios from "axios";
import { useNavigate } from "react-router";

export const AdminPanelUser = () => {
    const LIMIT = 10;

    const [users, setUsers] = useState<any[]>([]);
    const [rols, setRols] = useState<string[]>(['user', 'blocked', 'moderator', 'admin']);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const user = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user") || "{}")
        : null;

    const token = localStorage.getItem("token");

    const [bg] = useState(user ? user.background : null);
    const navigate = useNavigate();

    const changeRole = async (userId: string, role: string) => {
        try {
            await axios.patch(
                `http://localhost:4000/api/auth/update?id=${userId}`,
                { role },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setUsers(prev =>
                prev.map(u => u._id === userId ? { ...u, role } : u)
            );

        } catch (err) {
            console.error(err);
        }
    };

    const fetchUsers = async (pageNumber = 1) => {
        try {
            setLoading(true);
            setError(null);

            const res = await axios.get(
                `http://localhost:4000/api/auth?page=${pageNumber}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setUsers(res.data.users);
            setPage(res.data.page);
            setPages(res.data.pages);

        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(page);
    }, [page]);

    useEffect(() => {
        if (!user || user.role === "blocked" || user.role === "moderator") {
            navigate("/");
        }
    }, [user, navigate]);

    return (
        <div
            className={styles.page} 
        >

            {loading && <Loader />}

            {!loading && error && (
                <div className="text-danger text-center py-5">
                    {error}
                </div>
            )}

            {!loading && !error && (
                <div>

                    <div className={`${styles.page} ${styles.content} container py-4`}>
                        <h1 className={styles.title}>Admin Panel</h1>

                        <table className="table table-dark table-striped">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Icon</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                </tr>
                            </thead>

                            <tbody>
                                {users
                                    .filter(user => user._id !== user?._id && user.role !== "admin")
                                    .map((user, index) => (
                                        <tr key={user._id}>

                                            <th scope="row">
                                                {(page - 1) * LIMIT + index + 1}
                                            </th>

                                            <td>
                                                <img
                                                    src={
                                                        user.icon ||
                                                        "https://cdn-icons-png.freepik.com/256/12225/12225881.png"
                                                    }
                                                    className="rounded-circle"
                                                    width="60"
                                                    height="60"
                                                    alt="Avatar"
                                                />
                                            </td>

                                            <td>{user.name}</td>
                                            <td>{user.email}</td>
                                            <td>
                                                <select
                                                    className="form-select"
                                                    value={user.role}
                                                    style={{ backgroundColor: "#1e1e1e", color: "white" }}
                                                    onChange={(e) => changeRole(user._id, e.target.value)}
                                                >
                                                    {rols.map((role) => (
                                                        <option key={role} value={role}>
                                                            {role}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>

                                        </tr>

                                    ))}
                            </tbody>
                        </table>

                        {pages > 1 && (
                            <div className="d-flex justify-content-center mt-4 gap-2 flex-wrap">

                                {Array.from({ length: pages }, (_, i) => i + 1).map(p => (

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

                </div>
            )}
        </div>
    );
};