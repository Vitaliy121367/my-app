import { useEffect, useState } from "react";
import Loader from "../../components/Loader/Loader";
import styles from "../../components/styles.module.css";
import style from "./AdminPanelUser.module.css";
import axios from "axios";
import { useNavigate } from "react-router";

export const AdminPanelUser = () => {
    const LIMIT = 10;
    const [users, setUsers] = useState<any[]>([]);
    const [rols] = useState<string[]>(["user", "blocked", "moderator", "admin"]);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const currentUser = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user") || "{}")
        : null;
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    const fetchUsers = async (pageNumber = 1) => {
        try {
            setLoading(true);
            setError(null);

            const res = await axios.get(
                `http://localhost:4000/api/auth?page=${pageNumber}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const filteredUsers = res.data.users.filter(
                (u: any) => u._id !== currentUser?._id
            );

            setUsers(filteredUsers);
            setPage(res.data.page);
            setPages(res.data.pages);

        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    const changeRole = async (userId: string, role: string) => {
        try {
            await axios.patch(
                `http://localhost:4000/api/auth/role/${userId}`,
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

    useEffect(() => {
        fetchUsers(page);
    }, [page]);

    useEffect(() => {
        if (!currentUser || currentUser.role === "blocked" || currentUser.role === "moderator") {
            navigate("/");
        }
    }, [currentUser, navigate]);

    return (
        <div className={style.page}>
            {loading && <Loader />}

            {!loading && error && (
                <div className="text-danger text-center py-5">{error}</div>
            )}

            {!loading && !error && (
                <div className={`${style.page} ${styles.content} container py-4`}>
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
                            {users.map((u, index) => (
                                <tr key={u._id}>
                                    <th scope="row">{(page - 1) * LIMIT + index + 1}</th>
                                    <td>
                                        <img
                                            src={u.icon || "https://cdn-icons-png.freepik.com/256/12225/12225881.png"}
                                            className="rounded-circle"
                                            width={60}
                                            height={60}
                                            alt="Avatar"
                                        />
                                    </td>
                                    <td>{u.name}</td>
                                    <td>{u.email}</td>
                                    <td>
                                        <select
                                            className="form-select"
                                            value={u.role}
                                            style={{ backgroundColor: "#1e1e1e", color: "white" }}
                                            onChange={(e) => changeRole(u._id, e.target.value)}
                                        >
                                            {rols.map(role => (
                                                <option key={role} value={role}>{role}</option>
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
            )}
        </div>
    );
};