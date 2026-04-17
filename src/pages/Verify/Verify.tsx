import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "../../components/styles.module.css";
import style from "./Verify.module.css";
import { Navbar } from "../../components/Navbar/Navbar";
import { Footer } from "../../components/Footer/Footer";

export const Verify = () => {
  const apiUrl="https://myapi0305-cua6cdb7ghdxgtfk.polandcentral-01.azurewebsites.net";
  const { token } = useParams();
  const [status, setStatus] = useState("loading");
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const verify = async () => {
      try {
        await axios.get(
          `${apiUrl}/api/auth/verify/${token}`
        );
        setStatus("success");
      } catch (e) {
        setStatus("error");
      }
    };

    if (token) verify();
  }, [token]);

  return (
  <div className={styles.page}>
    <Navbar />

    <div className={styles.content}>
      <h2 className={styles.title}>
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