import { useNavigate } from "react-router-dom";
import { Navbar } from "../../components/Navbar/Navbar";
import { Footer } from "../../components/Footer/Footer";
import { useEffect, useState } from "react";
import styles from "./Settings.module.css";
import Button from "../../UI/Button/Button";
import axios from "axios";
import Input from "../../UI/Input/Input";
import countries from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json";
import { sha1 } from "js-sha1";

countries.registerLocale(en);

const excludedCountries = ["Russian Federation", "Belarus"];

const countryList = [
  "Unknown",
  ...Object.values(countries.getNames("en", { select: "official" }))
    .filter(c => !excludedCountries.includes(c))
    .sort((a, b) => a.localeCompare(b))
];

type ValidationRules = {
  required?: boolean;
  email?: boolean;
  minLength?: number;
  url?: boolean;
};

type Control = {
  type: string;
  label: string;
  errorMessage: string;
  value: string;
  validation: ValidationRules;
  valid: boolean;
  touched: boolean;
  options?: string[];
};

type FormControls = {
  name: Control;
  email: Control;
  password: Control;
  passwordConfirmation: Control;
  icon: Control;
  background: Control;
  country: Control;
  passwordDelete: Control;
  passwordDeleteConfirmation: Control;
};

export const Settings = () => {
  const savedUser = localStorage.getItem("user");
  const token = localStorage.getItem("token");

  const [user, setUser] = useState<any>(savedUser ? JSON.parse(savedUser) : null);
  const [bg, setBg] = useState<string>(user?.background || "");

  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [errorDel, setErrorDel] = useState("");
  const [isFormValid, setIsFormValid] = useState(true);

  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false
  });

  const [passwordStrength, setPasswordStrength] = useState({
    label: "",
    color: "#ccc",
    width: "0%"
  });

  const [formControls, setFormControls] = useState<FormControls>({
    name: {
      type: "text",
      label: "Name",
      errorMessage: "Min 5 chars",
      value: user?.name || "",
      validation: { required: true, minLength: 5 },
      valid: true,
      touched: false
    },
    email: {
      type: "email",
      label: "Email",
      errorMessage: "Valid email",
      value: user?.email || "",
      validation: { required: true, email: true },
      valid: true,
      touched: false
    },
    password: {
      type: "password",
      label: "Password",
      errorMessage: "",
      value: "",
      validation: { minLength: 8 },
      valid: true,
      touched: false
    },
    passwordConfirmation: {
      type: "password",
      label: "Confirm",
      errorMessage: "Must match",
      value: "",
      validation: { minLength: 8 },
      valid: true,
      touched: false
    },
    icon: {
      type: "url",
      label: "Icon URL",
      errorMessage: "Valid URL",
      value: user?.icon || "",
      validation: { url: true },
      valid: true,
      touched: false
    },
    background: {
      type: "url",
      label: "Background URL",
      errorMessage: "Valid URL",
      value: user?.background || "",
      validation: { url: true },
      valid: true,
      touched: false
    },
    country: {
      type: "select",
      label: "Country",
      errorMessage: "Required",
      value: user?.country || "Unknown",
      validation: { required: true },
      valid: true,
      touched: false,
      options: countryList
    },
    passwordDelete: {
      type: "password",
      label: "passwordDelete",
      errorMessage: "Must match",
      value: "",
      validation: { minLength: 8 },
      valid: true,
      touched: false
    },
    passwordDeleteConfirmation: {
      type: "password",
      label: "DeleteConfirmation",
      errorMessage: "Must match",
      value: "",
      validation: { minLength: 8 },
      valid: true,
      touched: false
    }
  });

  const validateControl = (value: string, rules: ValidationRules) => {
    if (!rules) return true;

    let isValid = true;

    if (rules.required) isValid = value.trim() !== "" && isValid;

    if (rules.minLength && value.trim() !== "")
      isValid = value.length >= rules.minLength && isValid;

    if (rules.email && value.trim() !== "")
      isValid = /\S+@\S+\.\S+/.test(value) && isValid;

    if (rules.url && value.trim() !== "") {
      try {
        new URL(value);
      } catch {
        isValid = false;
      }
    }

    return isValid;
  };

  const getPasswordValidation = (value: string) => ({
    minLength: value.length >= 8,
    hasUppercase: /[A-Z]/.test(value),
    hasLowercase: /[a-z]/.test(value)
  });

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

  const checkPasswordLeak = async (password: string) => {
    try {
      const hash = sha1(password).toUpperCase();
      const prefix = hash.slice(0, 5);
      const suffix = hash.slice(5);

      const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
      const text = await res.text();

      return text.split("\n").some(line => line.startsWith(suffix));
    } catch {
      return false;
    }
  };

  const onChangeHandler = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    name: keyof FormControls
  ) => {
    const updatedControls = { ...formControls };
    const control = { ...updatedControls[name] };

    control.value = e.target.value;
    control.touched = true;
    control.valid = validateControl(control.value, control.validation);

    updatedControls[name] = control;

    if (name === "password") {
      setPasswordValidation(getPasswordValidation(control.value));
      setPasswordStrength(getPasswordStrength(control.value));
    }

    let formIsValid = true;

    Object.keys(updatedControls).forEach(
      key =>
      (formIsValid =
        updatedControls[key as keyof FormControls].valid && formIsValid)
    );

    setFormControls(updatedControls);
    setIsFormValid(formIsValid);
  };

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    if (!token) return setError("Not authorized");

    if (formControls.password.value) {
      const { minLength, hasUppercase, hasLowercase } = passwordValidation;

      if (!minLength || !hasUppercase || !hasLowercase) {
        return setError(
          "Password must be at least 8 characters with upper and lowercase letters"
        );
      }

      if (formControls.password.value !== formControls.passwordConfirmation.value) {
        return setError("Passwords do not match");
      }

      const leaked = await checkPasswordLeak(formControls.password.value);

      if (leaked)
        return setError(
          "This password has appeared in data breaches. Choose another."
        );
    }

    try {
      const updatedData: any = {};

      Object.keys(formControls).forEach(key => {
        const control = formControls[key as keyof FormControls];

        if (control.value.trim() !== "" && control.value !== user[key]) {
          updatedData[key] = control.value;
        }
      });

      if (formControls.password.value.trim() !== "")
        updatedData.password = formControls.password.value;

      const res = await axios.patch(
        `http://localhost:4000/api/auth/update`,
        updatedData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      localStorage.setItem("user", JSON.stringify(res.data));

      setUser(res.data);
      setBg(res.data.background || user.background);

      navigate("/profile");
    } catch (err: any) {
      setError(err.response?.data?.message || "Update failed");
    }
  };

  const deleteAccountHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorDel("");

    if (!token) return setErrorDel("Not authorized");

    const password = formControls.passwordDelete.value;
    const confirm = formControls.passwordDeleteConfirmation.value;

    if (!password) return setErrorDel("Enter password");
    if (password.length < 8) return setErrorDel("Password must be at least 8 characters");
    if (password !== confirm) return setErrorDel("Passwords do not match");

    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;

    try {
      await axios.delete("http://localhost:4000/api/auth/remove", {
        data: { password },
        headers: { Authorization: `Bearer ${token}` }
      });

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      navigate("/");
    } catch (err: any) {
      setErrorDel(err.response?.data?.message || "Account deletion failed");
    }
  };

  useEffect(() => {
    if (!user || user.role === "blocked") navigate("/");
  }, [user, navigate]);

  return (
    <div className={styles.page}>
      <Navbar />

      <div className={styles.content}>
        <h2 className={styles.title}>Settings</h2>

        <div className="container py-4">
          <form onSubmit={submitHandler}>

            <div className="row g-3 mb-3">
              <div className="col">
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
              </div>

              <div className="col">
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
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col">
                <Input
                  type="password"
                  label="Password"
                  value={formControls.password.value}
                  valid={formControls.password.valid}
                  touched={formControls.password.touched}
                  errorMessage={formControls.password.errorMessage}
                  shouldValidate={true}
                  onChange={(e: any) => onChangeHandler(e, "password")}
                />

                {formControls.password.touched && formControls.password.value && (
                  <>
                    <div
                      style={{
                        height: "8px",
                        background: "#eee",
                        borderRadius: "5px",
                        overflow: "hidden",
                        marginTop: "8px"
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: passwordStrength.width,
                          background: passwordStrength.color,
                          transition: "0.3s"
                        }}
                      />
                    </div>

                    <small style={{ color: passwordStrength.color }}>
                      Password strength: {passwordStrength.label}
                    </small>

                    <ul className="mt-2" style={{ listStyle: "none", padding: 0 }}>
                      <li style={{ color: passwordValidation.minLength ? "green" : "red" }}>
                        {passwordValidation.minLength ? "✔" : "✖"} Minimum 8 characters
                      </li>

                      <li style={{ color: passwordValidation.hasUppercase ? "green" : "red" }}>
                        {passwordValidation.hasUppercase ? "✔" : "✖"} Uppercase letter
                      </li>

                      <li style={{ color: passwordValidation.hasLowercase ? "green" : "red" }}>
                        {passwordValidation.hasLowercase ? "✔" : "✖"} Lowercase letter
                      </li>
                    </ul>
                  </>
                )}
              </div>

              <div className="col">
                <Input
                  type="password"
                  label="Confirm"
                  value={formControls.passwordConfirmation.value}
                  valid={formControls.passwordConfirmation.valid}
                  touched={formControls.passwordConfirmation.touched}
                  errorMessage={formControls.passwordConfirmation.errorMessage}
                  shouldValidate={true}
                  onChange={(e: any) => onChangeHandler(e, "passwordConfirmation")}
                />
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col">
                <Input
                  type="url"
                  label="Icon URL"
                  value={formControls.icon.value}
                  valid={formControls.icon.valid}
                  touched={formControls.icon.touched}
                  errorMessage={formControls.icon.errorMessage}
                  shouldValidate={true}
                  onChange={(e: any) => onChangeHandler(e, "icon")}
                />
              </div>

              <div className="col">
                <Input
                  type="url"
                  label="Background URL"
                  value={formControls.background.value}
                  valid={formControls.background.valid}
                  touched={formControls.background.touched}
                  errorMessage={formControls.background.errorMessage}
                  shouldValidate={true}
                  onChange={(e: any) => onChangeHandler(e, "background")}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className={`${styles.title} form-label`}>Country</label>

              <select
                className={`form-select ${formControls.country.valid ? "" : "is-invalid"}`}
                value={formControls.country.value}
                onChange={e => onChangeHandler(e, "country")}
              >
                {formControls.country.options?.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>

              {!formControls.country.valid && formControls.country.touched && (
                <div className="invalid-feedback">
                  {formControls.country.errorMessage}
                </div>
              )}
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <Button
              type="submit"
              disabled={!isFormValid || passwordStrength.label === "Weak"}
            >
              Edit
            </Button>

          </form>

          <div className={`${styles.accordion} accordion accordion-flush mt-5`} id="accordionFlushExample">
            <div className={`accordion-item ${styles.accordionItem}`}>

              <h2 className="accordion-header">
                <button
                  className={`accordion-button collapsed ${styles.accordionHeader}`}
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#flush-collapseOne"
                >
                  Delete Account
                </button>
              </h2>

              <div
                id="flush-collapseOne"
                className="accordion-collapse collapse"
                data-bs-parent="#accordionFlushExample"
              >
                <div className={styles.accordionBody}>
                  <form onSubmit={deleteAccountHandler}>

                    <Input
                      type="password"
                      label="Password"
                      value={formControls.passwordDelete.value}
                      valid={formControls.passwordDelete.valid}
                      touched={formControls.passwordDelete.touched}
                      errorMessage={formControls.passwordDelete.errorMessage}
                      shouldValidate={true}
                      onChange={(e: any) => onChangeHandler(e, "passwordDelete")}
                    />

                    <Input
                      type="password"
                      label="Confirm"
                      value={formControls.passwordDeleteConfirmation.value}
                      valid={formControls.passwordDeleteConfirmation.valid}
                      touched={formControls.passwordDeleteConfirmation.touched}
                      errorMessage={formControls.passwordDeleteConfirmation.errorMessage}
                      shouldValidate={true}
                      onChange={(e: any) => onChangeHandler(e, "passwordDeleteConfirmation")}
                    />

                    {errorDel && <div className="alert alert-danger">{errorDel}</div>}

                    <Button type="submit" variant="danger">
                      Delete Account
                    </Button>

                  </form>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};