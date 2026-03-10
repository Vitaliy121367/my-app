import { Outlet, useNavigate } from "react-router-dom";
import { Navbar } from "../../components/Navbar/Navbar";
import { Footer } from "../../components/Footer/Footer";
import styles from "./Login.module.css";
import axios from "axios";
import { useState } from "react";
import Input from "../../UI/Input/Input";
import Button from "../../UI/Button/Button";

type ValidationRules = {
  required?: boolean;
  email?: boolean;
  minLength?: number;
};

type Control = {
  type: string;
  label: string;
  errorMessage: string;
  value: string;
  validation: ValidationRules;
  valid: boolean;
  touched: boolean;
};

type FormControls = {
  email: Control;
  password: Control;
};

export const Login = () => {
  const navigate = useNavigate();

  const [isFormValid, setIsFormValid] = useState(false);
  const [error, setError] = useState("");
  const [formControls, setFormControls] = useState<FormControls>({
    email: {
      type: "email",
      label: "Email",
      errorMessage: "Enter a valid email address",
      value: "",
      validation: { required: true, email: true },
      valid: false,
      touched: false,
    },
    password: {
      type: "password",
      label: "Password",
      errorMessage: "",
      value: "",
      validation: { required: true, minLength: 8 },
      valid: false,
      touched: false,
    },
  });

  const validateControl = (value: string, validation: ValidationRules) => {
    if (!validation) return true;

    let isValid = true;

    if (validation.required) {
      isValid = value.trim() !== "" && isValid;
    }

    if (validation.email) {
      isValid = /\S+@\S+\.\S+/.test(value) && isValid;
    }

    if (validation.minLength) {
      isValid = value.length >= validation.minLength && isValid;
    }

    return isValid;
  };

  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
  });

  const getPasswordValidation = (value: string) => {
    return {
      minLength: value.length >= 8,
      hasUppercase: /[A-Z]/.test(value),
      hasLowercase: /[a-z]/.test(value),
    };
  };

  const onChangeHandler = (
    e: React.ChangeEvent<HTMLInputElement>,
    controlName: keyof FormControls
  ) => {
    const updatedControls = { ...formControls };
    const control = { ...updatedControls[controlName] };

    control.value = e.target.value;
    control.touched = true;
    control.valid = validateControl(control.value, control.validation);

    updatedControls[controlName] = control;

    if (controlName === "password") {
      setPasswordValidation(getPasswordValidation(control.value));
    }

    let formIsValid = true;
    Object.keys(updatedControls).forEach(
      (name) => (formIsValid = updatedControls[name as keyof FormControls].valid && formIsValid)
    );

    setFormControls(updatedControls);
    setIsFormValid(formIsValid);
  };

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:4000/api/auth/login", {
        email: formControls.email.value,
        password: formControls.password.value,
      });

      const token = res.data.token;

      localStorage.setItem("token", token);

      const resUser = await axios.get("http://localhost:4000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });


      localStorage.setItem("user", JSON.stringify(resUser.data));
      navigate("/");
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Error logging in. Please try again.");
      }
    }
  };

  return (
    <div className={styles.page}>
      <Navbar />

      <div className={styles.content}>
        <h2 className={styles.title}>Login</h2>

        <div className="container py-4">
          <div className={`row ${styles.loginContainer}`}>
            <div className="col-sm-10 col-md-6 col-lg-5 mx-auto">
              <form onSubmit={submitHandler}>
                {Object.keys(formControls).map((controlName) => {
                  const control = formControls[controlName as keyof FormControls];
                  return (
                    <Input
                      key={controlName}
                      type={control.type}
                      label={control.label}
                      value={control.value}
                      valid={control.valid}
                      touched={control.touched}
                      errorMessage={control.errorMessage}
                      shouldValidate={!!control.validation}
                      onChange={(e: any) => onChangeHandler(e, controlName as keyof FormControls)}
                      autoComplete={control.type === "password" ? "new-password" : "on"}
                      spellCheck={control.type === "password" ? false : undefined}
                    />
                  );
                })}
                {formControls.password.touched && (
                  <ul style={{ listStyle: "none", padding: 0, marginTop: "0.5rem" }}>
                    <li style={{ color: passwordValidation.minLength ? "green" : "red" }}>
                      {passwordValidation.minLength ? "✔" : "✖"} Minimum 8 characters
                    </li>
                    <li style={{ color: passwordValidation.hasUppercase ? "green" : "red" }}>
                      {passwordValidation.hasUppercase ? "✔" : "✖"} At least one uppercase letter
                    </li>
                    <li style={{ color: passwordValidation.hasLowercase ? "green" : "red" }}>
                      {passwordValidation.hasLowercase ? "✔" : "✖"} At least one lowercase letter
                    </li>
                  </ul>
                )}
                {error && <div className="alert alert-danger mt-3">{error}</div>}

                <Button type="submit" disabled={!isFormValid}>
                  Log In
                </Button>
              </form>
            </div>
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
};
