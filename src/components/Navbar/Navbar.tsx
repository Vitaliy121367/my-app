import { Link, NavLink, useNavigate } from "react-router-dom"
import styles from './Navbar.module.css'
import { useState } from "react"

const Navbar = () => {
    const navidate = useNavigate()
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'))

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
        navidate('/login');
    }

    const links = [
        { to: "/news", label: "News" },
        { to: "/lastloaded", label: "Last Loaded" }
    ]

    return (
        <nav className={`navbar navbar-expand-lg  ${styles.Nav}`}>
            <div className="container-fluid">
                <button className={`navbar-toggler ${styles.buttonBg}`} type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon "></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav">
                        <NavLink className={({ isActive }) => `nav-link fs-4 fw-medium navbar-brand ${styles.textColor}` + (isActive ? ` ${styles.textColorActive}` : "")} to="/">Games</NavLink>
                        {links.map(link => (
                            <li className="nav-item" key={link.to}>
                                <NavLink
                                    to={link.to}
                                    className={({ isActive }) => `nav-link navbar-brand ${styles.textColor}` + (isActive ? ` ${styles.textColorActive}` : "")}
                                >
                                    {link.label}
                                </NavLink>
                            </li>

                        ))}
                        {!token && (
                            <div className="d-flex gap-3 align-items-center">
                                <NavLink className={({ isActive }) => `nav-link fs-4 fw-medium navbar-brand ${styles.textColor}` + (isActive ? ` ${styles.textColorActive}` : "")} to="/register">Register</NavLink>
                                <NavLink className={({ isActive }) => `nav-link fs-4 fw-medium navbar-brand ${styles.textColor}` + (isActive ? ` ${styles.textColorActive}` : "")} to="/login">Login</NavLink>
                            </div>
                        )}
                        {token && (
                            <div className="d-flex gap-3 align-items-center">
                                <NavLink className={({ isActive }) => `nav-link fs-4 fw-medium navbar-brand ${styles.textColor}` + (isActive ? ` ${styles.textColorActive}` : "")} to="/profile">Profile</NavLink>

                                <button
                                    type="button"
                                    className="btn btn-danger ms-3"
                                    onClick={handleLogout}
                                >
                                    LogOut
                                </button>
                            </div>
                        )}
                    </ul>

                </div>
            </div>
        </nav>

    )
}
export { Navbar }