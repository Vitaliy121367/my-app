import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "../../components/styles.module.css";
import style from "./VerifyEditEmail.module.css";
import { Navbar } from "../../components/Navbar/Navbar";
import { Footer } from "../../components/Footer/Footer";

export const VerifyEditEmail = () => {
  const apiUrl="myfastrunsapi0305-hzekc5edahebbtca.polandcentral-01.azurewebsites.net";
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const verify = async () => {
      try {
        await axios.get(`${apiUrl}/api/auth/verify-edit/${token}`);
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
          {status === "loading" && "Verifying..."}
          {status === "success" && "Success ✅"}
          {status === "error" && "Error ❌"}
        </h2>
      </div>

      <Footer />
    </div>
  );
};