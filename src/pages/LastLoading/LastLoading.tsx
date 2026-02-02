import { Outlet } from "react-router-dom";
import { Navbar } from "../../components/Navbar/Navbar";
import Loader from "../../components/Loader/Loader";
import { Footer } from "../../components/Footer/Footer";

export const LastLoading = () => {
    return (
        <div>
            <Navbar />
            <h2>Last Loading</h2>
            <Outlet />
            <Footer />
        </div>
    )
}