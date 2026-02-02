import { Outlet } from "react-router-dom";
import { Navbar } from "../../components/Navbar/Navbar";
import { Footer } from "../../components/Footer/Footer";

export const NotFoundPage = () => {
    return (
        <div>
            <Navbar />
            <h2>Page Not Found</h2>
            <Outlet />
            <Footer />
        </div>
    )
}