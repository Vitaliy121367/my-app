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

countries.registerLocale(en);

const excludedCountries = [
    "Russian Federation",
    "Belarus"
];

const countryList = [
    "Unknown",
    ...Object.values(
        countries.getNames("en", { select: "official" })
    )
        .filter(country => !excludedCountries.includes(country))
        .sort((a, b) => a.localeCompare(b))
];

type ValidationRules = { required?: boolean; email?: boolean; minLength?: number; url?: boolean };
type Control = { type: string; label: string; errorMessage: string; value: string; validation: ValidationRules; valid: boolean; touched: boolean; options?: string[] };
type FormControls = { name: Control; email: Control; password: Control; passwordConfirmation: Control; icon: Control; background: Control; country: Control };

export const Settings = () => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    const [user, setUser] = useState<any>(savedUser ? JSON.parse(savedUser) : null);
    const [bg, setBg] = useState<string>(user?.background || "");
    const navigate = useNavigate();

    const [formControls, setFormControls] = useState<FormControls>({
        name: { type: "text", label: "Name", errorMessage: "Min 5 chars", value: user?.name || "", validation: { required: true, minLength: 5 }, valid: true, touched: false },
        email: { type: "email", label: "Email", errorMessage: "Valid email", value: user?.email || "", validation: { required: true, email: true }, valid: true, touched: false },
        password: { type: "password", label: "Password", errorMessage: "Min 6 chars", value: "", validation: { minLength: 6 }, valid: true, touched: false },
        passwordConfirmation: { type: "password", label: "Confirm", errorMessage: "Must match", value: "", validation: { minLength: 6 }, valid: true, touched: false },
        icon: { type: "url", label: "Icon URL", errorMessage: "Valid URL", value: user?.icon || "", validation: { url: true }, valid: true, touched: false },
        background: { type: "url", label: "Background URL", errorMessage: "Valid URL", value: user?.background || "", validation: { url: true }, valid: true, touched: false },
        country: { type: "select", label: "Country", errorMessage: "Required", value: user?.country || "Unknown", validation: { required: true }, valid: true, touched: false, options: countryList }
    });

    const [isFormValid, setIsFormValid] = useState(true);
    const [error, setError] = useState("");

    const validateControl = (value: string, rules: ValidationRules) => {
        if (!rules) return true;
        let isValid = true;
        if (rules.required) isValid = value.trim() !== "" && isValid;
        if (rules.minLength && value.trim() !== "") isValid = value.length >= rules.minLength && isValid;
        if (rules.email && value.trim() !== "") isValid = /\S+@\S+\.\S+/.test(value) && isValid;
        if (rules.url && value.trim() !== "") { try { new URL(value); } catch { isValid = false; } }
        return isValid;
    };

    const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>, name: keyof FormControls) => {
        const updatedControls = { ...formControls };
        const control = { ...updatedControls[name] };
        control.value = e.target.value;
        control.touched = true;
        control.valid = validateControl(control.value, control.validation);
        updatedControls[name] = control;
        let formIsValid = true;
        Object.keys(updatedControls).forEach((key) => (formIsValid = updatedControls[key as keyof FormControls].valid && formIsValid));
        setFormControls(updatedControls);
        setIsFormValid(formIsValid);
    };

    const submitHandler = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!token) return setError("Not authorized");
        if (formControls.password.value && formControls.password.value !== formControls.passwordConfirmation.value) return setError("Password mismatch");

        try {
            const updatedData: any = {};
            Object.keys(formControls).forEach((key) => {
                const control = formControls[key as keyof FormControls];
                if (control.value.trim() !== "" && control.value !== user[key]) updatedData[key] = control.value;
            });

            if (formControls.password.value.trim() !== "") updatedData.password = formControls.password.value;

            const res = await axios.patch(`http://localhost:4000/api/auth/update`, updatedData, {
                headers: { Authorization: `Bearer ${token}` },
            });


            localStorage.setItem("user", JSON.stringify(res.data));
            setUser(res.data);
            setBg(res.data.background || user.background);
            navigate("/profile");
        } catch (err: any) {
            console.error(err.response?.data || err);
            setError(err.response?.data?.message || "Update failed");
        }
    };
    useEffect(() => {
        if (!user || user.role === "blocked") {
            navigate("/");
        }
    }, [user, navigate]);

    return (
        <div style={{ backgroundImage: `url(${bg})`, backgroundSize: "cover", backgroundPosition: "center", minHeight: "100vh" }}>
            <Navbar />
            <div className={styles.content}>
                <h2 className={styles.title}>Settings</h2>
                <div className="container py-4">
                    <div className={`row ${styles.container}`}>
                        <div className="col-sm-10 col-md-6 col-lg-5 mx-auto">
                            <form onSubmit={submitHandler}>
                                {Object.keys(formControls).map((key) => {
                                    const control = formControls[key as keyof FormControls];

                                    if (control.type === "select") {
                                        return (
                                            <div className="mb-3" key={key}>
                                                <label className={styles.title}>{control.label}</label>

                                                <select
                                                    className="form-select"
                                                    value={control.value}
                                                    onChange={(e) =>
                                                        onChangeHandler(e as any, key as keyof FormControls)
                                                    }
                                                >
                                                    <option value="">Select country</option>

                                                    {control.options?.map((country) => (
                                                        <option key={country} value={country}>
                                                            {country}
                                                        </option>
                                                    ))}
                                                </select>

                                                {!control.valid && control.touched && (
                                                    <div className="text-danger small">
                                                        {control.errorMessage}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }

                                    return (
                                        <Input
                                            key={key}
                                            type={control.type}
                                            label={control.label}
                                            value={control.value}
                                            valid={control.valid}
                                            touched={control.touched}
                                            errorMessage={control.errorMessage}
                                            shouldValidate={!!control.validation}
                                            onChange={(e: any) =>
                                                onChangeHandler(e, key as keyof FormControls)
                                            }
                                        />
                                    );
                                })}
                                {error && <div className="alert alert-danger mt-3">{error}</div>}
                                <Button type="submit" disabled={!isFormValid}>Edit</Button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};
