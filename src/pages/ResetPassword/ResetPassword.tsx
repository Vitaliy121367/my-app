import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { sha1 } from "js-sha1";
import { Navbar } from "../../components/Navbar/Navbar";
import { Footer } from "../../components/Footer/Footer";
import Input from "../../UI/Input/Input";
import styles from "../../components/styles.module.css";
import style from "./ResetPassword.module.css";

export const ResetPassword = () => {
  const apiUrl="https://myapi0305-cua6cdb7ghdxgtfk.polandcentral-01.azurewebsites.net";
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const checkPasswordLeak = async (password: string) => {
    const hash = sha1(password).toUpperCase();
    const res = await fetch(
      `https://api.pwnedpasswords.com/range/${hash.slice(0, 5)}`
    );
    const text = await res.text();
    return text.includes(hash.slice(5));
  };

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirm) {
      return setError("Passwords do not match");
    }

    if (await checkPasswordLeak(password)) {
      return setError("Password leaked in breaches");
    }

    try {
      await axios.post(
        `${apiUrl}/api/auth/reset-password/${token}`,
        { password }
      );
      setMessage("Password updated successfully!");
      setTimeout(() => navigate("/login"), 1500);
    } catch {
      setError("Invalid or expired link");
    }
  };

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.content}>
        <h2 className={styles.title}>Reset Password</h2>

        <form
          className="col-sm-10 col-md-6 col-lg-5 mx-auto"
          onSubmit={submitHandler}
        >
          <div className="mb-3">
            <Input
              type="password"
              label="New password"
              value={password}
              valid={true}
              touched={true}
              errorMessage="Enter your new password"
              shouldValidate={true}
              onChange={(e: any) => setPassword(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <Input
              type="password"
              label="Confirm password"
              value={confirm}
              valid={true}
              touched={true}
              errorMessage="Confirm your password"
              shouldValidate={true}
              onChange={(e: any) => setConfirm(e.target.value)}
            />
          </div>

          {error && <div className="alert alert-danger">{error}</div>}
          {message && <div className="alert alert-success">{message}</div>}

          <button className="btn btn-outline-danger" type="submit">
            Change Password
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
};