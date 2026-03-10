import { useNavigate } from "react-router-dom";
import { Navbar } from "../../components/Navbar/Navbar";
import { Footer } from "../../components/Footer/Footer";
import styles from "./Register.module.css";
import axios from "axios";
import { useState } from "react";
import Input from "../../UI/Input/Input";
import Button from "../../UI/Button/Button";
import { sha1 } from "js-sha1";

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
  name: Control;
  email: Control;
  password: Control;
};

export const Register = () => {
  const navigate = useNavigate();

  const [isFormValid, setIsFormValid] = useState(false);
  const [error, setError] = useState("");

  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
  });

  const [passwordStrength, setPasswordStrength] = useState({
    label: "",
    color: "#ccc",
    width: "0%",
  });

  const [formControls, setFormControls] = useState<FormControls>({
    name: {
      type: "text",
      label: "Name",
      errorMessage: "Minimum 5 characters",
      value: "",
      validation: { required: true, minLength: 5 },
      valid: false,
      touched: false,
    },
    email: {
      type: "email",
      label: "Email",
      errorMessage: "Enter a valid email",
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

  const getPasswordValidation = (value: string) => {
    return {
      minLength: value.length >= 8,
      hasUppercase: /[A-Z]/.test(value),
      hasLowercase: /[a-z]/.test(value),
    };
  };

  const checkPasswordLeak = async (password: string) => {
  const hash = sha1(password).toUpperCase();
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);

  const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
  const text = await res.text();

  const found = text.split("\n").some(line => line.startsWith(suffix));

  return found; 
};
  
  const getPasswordStrength = (password: string) => {
    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { label: "Weak", color: "#dc3545", width: "25%" };
    if (score === 3) return { label: "Medium", color: "#ffc107", width: "50%" };
    if (score === 4) return { label: "Strong", color: "#0dcaf0", width: "75%" };

    return { label: "Very Strong", color: "#198754", width: "100%" };
  };

  const onChangeHandler = (
    event: React.ChangeEvent<HTMLInputElement>,
    controlName: keyof FormControls
  ) => {
    const updatedControls = { ...formControls };
    const control = { ...updatedControls[controlName] };

    control.value = event.target.value;
    control.touched = true;
    control.valid = validateControl(control.value, control.validation);

    updatedControls[controlName] = control;

    if (controlName === "password") {
      setPasswordValidation(getPasswordValidation(control.value));
      setPasswordStrength(getPasswordStrength(control.value));
    }

    let formIsValid = true;

    Object.keys(updatedControls).forEach(
      (name) =>
        (formIsValid =
          updatedControls[name as keyof FormControls].valid && formIsValid)
    );

    setFormControls(updatedControls);
    setIsFormValid(formIsValid);
  };

  const submitHandler = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");

  const leaked = await checkPasswordLeak(formControls.password.value);

  if (leaked) {
    setError("This password has appeared in data breaches. Choose another.");
    return;
  }

  try {
    await axios.post("http://localhost:4000/api/auth/register", {
      name: formControls.name.value,
      email: formControls.email.value,
      password: formControls.password.value,
    });

    navigate("/");
  } catch (err: any) {
    setError(err.response?.data?.message || "Registration error");
  }
};

  return (
    <div className={styles.page}>
      <Navbar />

      <div className={styles.content}>
        <h2 className={styles.title}>Register</h2>

        <div className="container py-4">
          <div className={`row ${styles.registerContainer}`}>
            <div className="col-sm-10 col-md-6 col-lg-5 mx-auto">

              <form onSubmit={submitHandler}>

                <Input
                  type="text"
                  label="Name"
                  value={formControls.name.value}
                  valid={formControls.name.valid}
                  touched={formControls.name.touched}
                  errorMessage={formControls.name.errorMessage}
                  shouldValidate={true}
                  onChange={(e: any) => onChangeHandler(e, "name")}
                />

                <Input
                  type="email"
                  label="Email"
                  value={formControls.email.value}
                  valid={formControls.email.valid}
                  touched={formControls.email.touched}
                  errorMessage={formControls.email.errorMessage}
                  shouldValidate={true}
                  onChange={(e: any) => onChangeHandler(e, "email")}
                />

                <Input
                  type="password"
                  label="Password"
                  value={formControls.password.value}
                  valid={formControls.password.valid}
                  touched={formControls.password.touched}
                  errorMessage={formControls.password.errorMessage}
                  shouldValidate={true}
                  onChange={(e: any) => onChangeHandler(e, "password")}
                  autoComplete="new-password"
                  spellCheck={false}
                />

                {formControls.password.touched && (
                  <>
                    <div
                      style={{
                        height: "8px",
                        background: "#eee",
                        borderRadius: "5px",
                        overflow: "hidden",
                        marginTop: "8px",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: passwordStrength.width,
                          background: passwordStrength.color,
                          transition: "0.3s",
                        }}
                      />
                    </div>

                    <small style={{ color: passwordStrength.color }}>
                      Password strength: {passwordStrength.label}
                    </small>
                  </>
                )}

                {formControls.password.touched && (
                  <ul className="mt-2" style={{ listStyle: "none", padding: 0 }}>
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

                <Button
                  type="submit"
                  disabled={!isFormValid || passwordStrength.label === "Weak"}
                >
                  Register
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