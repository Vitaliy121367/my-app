import {Outlet} from "react-router-dom";
import { Navbar } from "../../components/Navbar/Navbar";
import { Footer } from "../../components/Footer/Footer";

export const Register = () => {
    return (
        <div>
            <Navbar/>
            <h2>Register</h2>
            <Outlet/>
            <Footer />
        </div>
    )
}