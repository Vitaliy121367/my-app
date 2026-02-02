import { Link, NavLink, useNavigate } from "react-router-dom"
import styles from './Navbar.module.css'

const Navbar = () => {
    const navidate = useNavigate()

    const handleLogout = () => {
        navidate('/')
    }
    const links = [
        { to: "/game", label: "Game" },
        { to: "/news", label: "News" },
        { to: "/lastloading", label: "Last Loading" },
        { to: "/register", label: "Register" },
        { to: "/login", label: "Login" },
        { to: "/profile", label: "Profile" }
    ]

    return (
        <nav className={`navbar navbar-expand-lg ${styles.Nav}`}>
            <div className="container-fluid">
                <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
                    <div className="navbar-nav">
                        <NavLink className={({ isActive }) => `nav-link fs-4 fw-medium navbar-brand ${styles.textColor}` + (isActive ? ` ${styles.textColorActive}` : "")} to="/">Games</NavLink>
                        {links.map(link => (
                            <NavLink 
                                key={link.to}
                                to={link.to}
                                className={({ isActive }) => `nav-link navbar-brand ${styles.textColor}` + (isActive ? ` ${styles.textColorActive}` : "")}
                            >
                                {link.label}
                            </NavLink>
                        ))}
                        <button type="button" className="btn btn-danger" onClick = {handleLogout} >LogOut</button>
                    </div>
                </div>
            </div>
        </nav>
    )
}
export { Navbar }