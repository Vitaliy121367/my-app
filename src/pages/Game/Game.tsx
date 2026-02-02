import { Outlet } from "react-router-dom";
import { Navbar } from "../../components/Navbar/Navbar";
import { Footer } from "../../components/Footer/Footer";

export const Game = () => {
    return (
        <div>
            <Navbar />
            <h2>Game</h2>
            <Outlet />
            <Footer />
        </div>
    )
}