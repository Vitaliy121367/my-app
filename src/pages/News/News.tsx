import {Outlet} from "react-router-dom";
import { Navbar } from "../../components/Navbar/Navbar";
import { Footer } from "../../components/Footer/Footer";

export const News = () => {
    return (
        <div>
            <Navbar/>
            <h2>News</h2>
            <Outlet/>
            <Footer />
        </div>
    )
}