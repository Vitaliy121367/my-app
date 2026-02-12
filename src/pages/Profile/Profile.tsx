import { Outlet } from "react-router-dom";
import { Navbar } from "../../components/Navbar/Navbar";
import { Footer } from "../../components/Footer/Footer";
import { useEffect, useState } from "react";
import axios from "axios";
import style from "./Profile.module.css";

export const Profile = () => {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(
                    "http://localhost:4000/api/auth/me",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setUser(res.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchUser();
    }, []);


    return (
        <div>
            <Navbar />
            <h2>Profile</h2>
            <h2>{user?.id}</h2>
            <h2>{user?.name}</h2>
            <h2>{user?.email}</h2>
            <h2>{user?.role}</h2>

            <Outlet />
            <Footer />
        </div>
    )
}