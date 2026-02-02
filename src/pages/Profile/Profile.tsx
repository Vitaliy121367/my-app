import {Outlet} from "react-router-dom";
import { Navbar } from "../../components/Navbar/Navbar";
import { Footer } from "../../components/Footer/Footer";

export const Profile = () => {
    return (
        <div>
            <Navbar/>
            <h2>Profile</h2>
            <Outlet/>
            <Footer />
        </div>
    )
}