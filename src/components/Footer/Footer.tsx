import { Link, NavLink } from "react-router-dom"
import styles from './Footer.module.css'

const Footer = () => {
    return (
        <div className={styles.footer}>
            <h2 className={styles.footerText}>Footer</h2>
        </div>
    )
}
export { Footer }