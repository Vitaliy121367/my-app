import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../../components/Navbar/Navbar";
import styles from "../../components/styles.module.css";
import style from "./ForgotPassword.module.css";
import { Footer } from "../../components/Footer/Footer";
import Input from "../../UI/Input/Input";

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await axios.post("http://localhost:4000/api/auth/forgot-password", {
        email,
      });

      setMessage("Email sent. Redirecting to home...");
      
      setTimeout(() => navigate("/"), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error sending email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <Navbar />

      <div className={styles.content}>
        <h2 className={styles.title}>Forgot Password</h2>

        <form
          className="col-sm-10 col-md-6 col-lg-5 mx-auto"
          onSubmit={submitHandler}
        >
          <div className="mb-3">
            <Input
              type="email"
              label="Email"
              value={email}
              valid={!!email}
              touched={!!email}
              errorMessage="Enter valid email"
              shouldValidate={true}
              onChange={(e: any) => setEmail(e.target.value)}
            />
          </div>

          {error && <div className="alert alert-danger">{error}</div>}
          {message && <div className="alert alert-success">{message}</div>}

          <button
            className="btn btn-outline-danger"
            type="submit"
            disabled={!email || loading}
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </form>
      </div>

      <Footer />
    </div>
  );
};