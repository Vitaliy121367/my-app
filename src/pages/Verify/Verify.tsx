import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import style from "./Verify.module.css";
import { Navbar } from "../../components/Navbar/Navbar";
import { Footer } from "../../components/Footer/Footer";

export const Verify = () => {
  const { token } = useParams();
  const [status, setStatus] = useState("loading");
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const verify = async () => {
      try {
        await axios.get(
          `http://localhost:4000/api/auth/verify/${token}`
        );
        setStatus("success");
      } catch (e) {
        setStatus("error");
      }
    };

    if (token) verify();
  }, [token]);

  return (
  <div className={style.page}>
    <Navbar />

    <div className={style.content}>
      <h2 className={style.title}>
      {
        status === "loading" && (
          "Verifying..."
        ) ||
        status === "success" && (
          "Success ✅"
        ) ||
        status === "error" && (
          "Error ❌"
        )
      }
      </h2>
    </div>

    <Footer />
  </div>
);
};