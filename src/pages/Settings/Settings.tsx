import { useNavigate } from "react-router-dom";
import { Navbar } from "../../components/Navbar/Navbar";
import { Footer } from "../../components/Footer/Footer";
import { useEffect, useState } from "react";
import styles from "../../components/styles.module.css";
import style from "./Settings.module.css";
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

type ValidationRules = { required?: boolean; email?: boolean; minLength?: number; url?: boolean };
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
  const apiUrl = "myfastrunsapi0305-hzekc5edahebbtca.polandcentral-01.azurewebsites.net";
  const savedUser = localStorage.getItem("user");
  const token = localStorage.getItem("token");

  const [user, setUser] = useState<any>(savedUser ? JSON.parse(savedUser) : null);
  const [files, setFiles] = useState<{ icon?: File; background?: File }>({});
  const [bg, setBg] = useState<string>(user?.background || "");
  const [error, setError] = useState("");
  const [errorDel, setErrorDel] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
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

  const navigate = useNavigate();

  const [formControls, setFormControls] = useState<FormControls>({
    name: { type: "text", label: "Name", errorMessage: "Min 5 chars", value: user?.name || "", validation: { required: true, minLength: 5 }, valid: true, touched: false },
    email: { type: "email", label: "Email", errorMessage: "Valid email", value: user?.email || "", validation: { required: true, email: true }, valid: true, touched: false },
    password: { type: "password", label: "Password", errorMessage: "", value: "", validation: { minLength: 8 }, valid: true, touched: false },
    passwordConfirmation: { type: "password", label: "Confirm", errorMessage: "Must match", value: "", validation: { minLength: 8 }, valid: true, touched: false },
    icon: { type: "url", label: "Icon URL", errorMessage: "Valid URL", value: user?.icon || "", validation: { url: true }, valid: true, touched: false },
    background: { type: "url", label: "Background URL", errorMessage: "Valid URL", value: user?.background || "", validation: { url: true }, valid: true, touched: false },
    country: { type: "select", label: "Country", errorMessage: "Required", value: user?.country || "Unknown", validation: { required: true }, valid: true, touched: false, options: countryList },
    passwordDelete: { type: "password", label: "passwordDelete", errorMessage: "Must match", value: "", validation: { minLength: 8 }, valid: true, touched: false },
    passwordDeleteConfirmation: { type: "password", label: "DeleteConfirmation", errorMessage: "Must match", value: "", validation: { minLength: 8 }, valid: true, touched: false }
  });

  const validateControl = (value: string, rules: ValidationRules) => {
    if (!rules) return true;

    let isValid = true;

    if (rules.required) {
      isValid = value.trim() !== "" && isValid;
    }

    if (rules.minLength) {
      isValid = value.length >= rules.minLength && isValid;
    }

    if (rules.email) {
      isValid = /\S+@\S+\.\S+/.test(value) && isValid;
    }

    if (rules.url) {
      if (value.trim() !== "") {
        try {
          new URL(value);
        } catch {
          isValid = false;
        }
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

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, name: keyof FormControls) => {
    const updated = { ...formControls };
    const control = { ...updated[name] };
    control.value = e.target.value;
    control.touched = true;
    control.valid = validateControl(control.value, control.validation);
    updated[name] = control;

    if (name === "password") {
      setPasswordValidation(getPasswordValidation(control.value));
      setPasswordStrength(getPasswordStrength(control.value));
    }

    let formValid = true;
    Object.keys(updated).forEach(k => {
      formValid = updated[k as keyof FormControls].valid && formValid;
    });

    setFormControls(updated);
    setIsFormValid(formValid);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, field: "icon" | "background") => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({ ...prev, [field]: e.target.files![0] }));
    }
  };

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) return setError("Not authorized");

    try {
      const formData = new FormData();

      Object.keys(formControls).forEach(key => {
        const control = formControls[key as keyof FormControls];

        if (control.value.trim() !== "" && control.value !== user[key]) {
          formData.append(key, control.value);
        }
      });

      if (files.icon) formData.append("icon", files.icon);
      if (files.background) formData.append("background", files.background);

      const res = await axios.patch(
        `${apiUrl}/api/auth/update`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      localStorage.setItem("user", JSON.stringify(res.data));
      setUser(res.data);
      setBg(res.data.background || "");
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
    if (!window.confirm("Are you sure you want to delete your account?")) return;

    try {
      await axios.delete(`${apiUrl}/api/auth/remove`, {
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
    <div
      className={styles.page}
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh"
      }}
    >
      <Navbar />
      <div className={styles.content}>
        <h2 className={styles.title}>Settings</h2>

        <div className="container py-4">
          <form onSubmit={submitHandler}>
            <div className="row g-3 mb-3">
              <div className="col">
                <Input {...formControls.name} onChange={(e: any) => onChangeHandler(e, "name")} />
              </div>
              <div className="col">
                <Input {...formControls.email} onChange={(e: any) => onChangeHandler(e, "email")} />
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col">
                <Input {...formControls.password} onChange={(e: any) => onChangeHandler(e, "password")} />
              </div>
              <div className="col">
                <Input {...formControls.passwordConfirmation} onChange={(e: any) => onChangeHandler(e, "passwordConfirmation")} />
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col">
                <label className={`form-label ${styles.title}`}>Icon</label>
                <input className="form-control" type="file" accept="image/*" onChange={e => handleFile(e, "icon")} />
              </div>
              <div className="col">
                <label className={`form-label ${styles.title}`}>Background</label>
                <input className="form-control" type="file" accept="image/*" onChange={e => handleFile(e, "background")} />
              </div>
            </div>

            <div className="mb-3">
              <label className={`form-label ${styles.title}`}>Country</label>
              <select
                className="form-select"
                value={formControls.country.value}
                onChange={e => onChangeHandler(e, "country")}
              >
                {formControls.country.options?.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {infoMessage && <div className="alert alert-success">{infoMessage}</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            <Button type="submit" disabled={!isFormValid || passwordStrength.label === "Weak"}>
              Edit
            </Button>
          </form>

          <div className={`${style.accordion} accordion accordion-flush mt-5`}>
            <div className={`accordion-item ${style.accordionItem}`}>
              <h2 className="accordion-header">
                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#del">
                  Delete Account
                </button>
              </h2>
              <div id="del" className="accordion-collapse collapse">
                <div className={style.accordionBody}>
                  <form onSubmit={deleteAccountHandler}>
                    <Input {...formControls.passwordDelete} onChange={(e: any) => onChangeHandler(e, "passwordDelete")} />
                    <Input {...formControls.passwordDeleteConfirmation} onChange={(e: any) => onChangeHandler(e, "passwordDeleteConfirmation")} />
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