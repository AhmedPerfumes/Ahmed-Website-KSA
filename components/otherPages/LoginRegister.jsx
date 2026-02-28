// LOGIN & REGISTER MODULE
"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useUser } from "@/context/UserContext";

export default function LoginRegister() {
    const locale = useLocale();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState("login");

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [registerStep, setRegisterStep] = useState(1);
    const [otp, setOtp] = useState("");
    const [customerId, setCustomerId] = useState(null);

    const [regName, setRegName] = useState("");
    const [regEmail, setRegEmail] = useState("");
    const [regMobile, setRegMobile] = useState("");
    const [regPassword, setRegPassword] = useState("");

    const [mobile, setMobile] = useState("");
    const [hasMounted, setHasMounted] = useState(false);

    const { setIsLoggedIn } = useUser();

    useEffect(() => {
        setHasMounted(true);
    }, []);

    useEffect(() => {
        if (!hasMounted) return;
        const token = localStorage.getItem("user");
        if (token) {
            router.replace(`/${locale}/account_dashboard`);
        }
    }, [hasMounted, router, locale]);

    useEffect(() => {
        const tabParam = searchParams.get("tab");
        if (tabParam === "register") {
            setActiveTab("register");
        } else {
            setActiveTab("login");
        }
    }, [searchParams]);

    const validateMobile = (event) => {
        const { value } = event.currentTarget;
        setMobile(value);
    };

    async function onRegister(event) {
        event.preventDefault();
        setIsLoading(true);
        if (regMobile === "") {
            setError("Mobile Number is Required");
            setSuccess(null);
            setIsLoading(false);
            return;
        }
        const regex = /^\d{10}$/;
        if (!regex.test(regMobile)) {
            setError("Invalid Mobile Number");
            setSuccess(null);
            setIsLoading(false);
            return;
        }

        setError(null);
        setSuccess(null);

        try {
            const formData = new FormData();
            formData.append("name", regName);
            formData.append("email", regEmail);
            formData.append("mobile", regMobile);
            formData.append("password", regPassword);

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}api/signup`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            if (!response.ok) {
                throw new Error("Failed to submit the data. Please try again.");
            }

            const data = await response.json();
            if (data.message.split(" ")[0] !== "OTP") {
                setError(data.message);
                setSuccess(null);
            } else {
                setSuccess(data.message);
                setError(null);
                setCustomerId(data?.data?.id || null);
                setRegisterStep(2); // move to OTP step

                // --- OTP BYPASS START ---
                // Instead of moving to step 2, we now directly call the verifyOTP endpoint
                // with a hardcoded OTP. This effectively bypasses the user-facing verification step.
                // NOTE: This assumes your backend accepts a default OTP like "123456" for development/testing.
                // setSuccess("Registration successful, logging you in...");

                // const verifyResponse = await fetch(
                //     `${process.env.NEXT_PUBLIC_API_URL}api/verifyOTP`,
                //     {
                //         method: "POST",
                //         headers: { "Content-Type": "application/json" },
                //         body: JSON.stringify({
                //             name: regName.trim(),
                //             email: regEmail.trim(),
                //             mobile: regMobile.trim(),
                //             password: regPassword.trim(),
                //             otp: "123456", // Hardcoded OTP for bypass
                //             flag: "signup",
                //         }),
                //     }
                // );
                
                // const verifyData = await verifyResponse.json();

                // if (!verifyResponse.ok || !verifyData.message?.toLowerCase().includes("customer")) {
                //     throw new Error(verifyData.message || "Auto-verification failed. Your account may have been created. Please try to log in.");
                // }
                
                // // If verification is successful, log the user in
                // setSuccess("Account created and verified successfully. Redirecting...");
                // localStorage.setItem("token", verifyData.access_token);
                // localStorage.setItem("user", btoa(JSON.stringify(verifyData.data)));
                // setTimeout(
                //     () =>
                //         (window.location.href = `/${locale}/account_dashboard`),
                //     1000
                // );
                // --- OTP BYPASS END ---
            }
        } catch (error) {
            setError(error.message);
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    async function onVerifyOtp(event) {
        event.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}api/verifyOTP`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: regName.trim(),
                        email: regEmail.trim(),
                        mobile: regMobile.trim(),
                        password: regPassword.trim(),
                        otp: otp.trim(),
                        flag: "signup",
                    }),
                }
            );

            const data = await response.json();
            if (!data.message?.toLowerCase().includes("customer")) {
                setError(data.message || "Invalid OTP");
                setSuccess(null);
            } else {
                setSuccess("Account verified successfully.");
                localStorage.setItem("token", data.access_token);
                localStorage.setItem("user", btoa(JSON.stringify(data.data)));
                // setTimeout(
                //     () =>
                //         (window.location.href = `/${locale}/account_dashboard`),
                //     1000
                // );
                router.push(`/${locale}/account_dashboard`);
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    }

    async function onLogin(event) {
        event.preventDefault();
        setIsLoading(true);
        if (mobile === "") {
            setError("Mobile Number is Required");
            setSuccess(null);
            setIsLoading(false);
            return;
        }
        const regex = /^\d{10}$/;
        if (!regex.test(mobile)) {
            setError("Invalid Mobile Number");
            setSuccess(null);
            setIsLoading(false);
            return;
        }

        setError(null);
        setSuccess(null);

        try {
            const formData = new FormData(event.currentTarget);
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/signin`,
                { method: "POST", body: formData, }
            );

            if (!response.ok) {
                throw new Error("Failed to submit the data. Please try again.");
            }

            const data = await response.json();
            if (data.message.split(" ")[0] !== "Login") {
                setError(data.message);
                setSuccess(null);
            } else {
                setSuccess(data.message);
                setError(null);
                localStorage.setItem("token", data.access_token);
                localStorage.setItem("user", btoa(JSON.stringify(data.data)));

                const defaultAddr = data?.data?.addresses?.find((addr) => addr.is_default);

                if (defaultAddr) {
                    localStorage.setItem("address", btoa(JSON.stringify({ id: defaultAddr.id, name: defaultAddr.name, email: defaultAddr.email, phone: defaultAddr.phone, state: defaultAddr.state, city: defaultAddr.city, address: defaultAddr.address, customer_id: defaultAddr.customer_id, is_default: 1, })));
                }
                setIsLoggedIn(true);
                // setTimeout(() => (window.location.href = "/"), 1000);
                router.push("/");
            }
        } catch (error) {
            setError(error.message);
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <section className="login-register container">
            <h2 className="d-none">Login & Register</h2>

            <ul className="nav nav-tabs mb-5" role="tablist">
                <li className="nav-items" role="presentation">
                    <button type="button" className={`border-0 bg-transparent nav-links nav-link_underscore ${activeTab === "login" ? "active" : ""}`} onClick={() => setActiveTab("login")}>
                        Login
                    </button>
                </li>
                <li className="nav-items" role="presentation">
                    <button type="button" className={`border-0 bg-transparent nav-links nav-link_underscore ${activeTab === "register" ? "active" : ""}`} onClick={() => setActiveTab("register")}>
                        Register
                    </button>
                </li>
            </ul>

            <div className="tab-content pt-2">
                {/* Login Tab */}
                <div className={`tab-pane fade ${activeTab === "login" ? "show active" : ""}`}>
                    {error ? ( <div style={{ color: "red" }}>{error}</div> ) : ( <div style={{ color: "green" }}> {success}</div> )}
                    <div className="pb-3"></div>

                    <form onSubmit={onLogin} className="needs-validation">
                        <div className="form-floating mb-3">
                            <input  name="mobile" type="number" min="0" className="form-control form-control_gray " placeholder="Mobile Number *" onChange={validateMobile} required />
                            <label>Mobile Number (Eg. 0500000000)</label>
                        </div>

                        <div className="form-floating mb-3">
                            <input name="password" type="password" className="form-control form-control_gray" placeholder="********" required />
                            <label>Password*</label>
                        </div>

                        <button className="btn btn-primary w-100 text-uppercase" type="submit" disabled={isLoading}>
                            {isLoading ? "Loading..." : "Login"}
                        </button>
                        <div className="d-flex align-items-center mb-3 pb-2">
                            <div className="form-check mb-0">
                                <input name="remember" className="form-check-input form-check-input_fill" type="checkbox" defaultValue="" />
                                <label className="form-check-label text-secondary"> Remember me </label>
                            </div>
                            <Link href="/reset_password" className="btn-text ms-auto" > Lost password? </Link>
                        </div>

                        <div className="customer-option mt-4 text-center">
                            <span className="text-secondary"> No account yet? </span>{" "}
                            <button type="button" className={`border-0 bg-transparent btn-text js-show-register ${activeTab === "register" ? "active" : ""}`} onClick={() => setActiveTab("register")} 
                            >
                                Create Account
                            </button>
                        </div>
                    </form>
                </div>

                {/* Register Tab */}
                <div className={`tab-pane fade ${activeTab === "register" ? "show active" : ""}`}>
                    {error ? ( <div style={{ color: "red" }}>{error}</div> ) : ( <div style={{ color: "green" }}>{success}</div> )}
                    <div className="pb-3"></div>

                    {registerStep === 1 && (
                        <form onSubmit={onRegister} className="needs-validation" >
                            <div className="form-floating mb-3">
                                <input name="name" type="text" className="form-control form-control_gray" placeholder="User Name" value={regName} onChange={(e) => setRegName(e.target.value)} required />
                                <label>User Name</label>
                            </div>

                            <div className="form-floating mb-3">
                                <input name="email" type="email" className="form-control form-control_gray" placeholder="Email Address *" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
                                <label>Email address *</label>
                            </div>

                            <div className="form-floating mb-3">
                                <input name="mobile" type="number" className="form-control form-control_gray" placeholder="Mobile Number *" value={regMobile} onChange={(e) => setRegMobile(e.target.value) } required />
                                <label>Mobile Number (Eg. 0500000000)*</label>
                            </div>

                            <div className="form-floating mb-3">
                                <input
                                    name="password"
                                    type="password"
                                    className="form-control form-control_gray"
                                    placeholder="********"
                                    value={regPassword}
                                    onChange={(e) =>
                                        setRegPassword(e.target.value)
                                    }
                                    required
                                />
                                <label>Password *</label>
                            </div>

                            <p className="mb-3">
                                Your personal data will be used to support your
                                experience throughout this website, to manage
                                access to your account, and for other purposes
                                described in our privacy policy.
                            </p>

                            <button
                                className="btn btn-primary w-100 text-uppercase"
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading ? "Sending OTP..." : "Register"}
                            </button>
                        </form>
                    )}

                    {registerStep === 2 && (
                        <form onSubmit={onVerifyOtp}>
                            <div className="form-floating mb-3">
                                <input
                                    name="otp"
                                    type="text"
                                    className="form-control form-control_gray"
                                    placeholder="Enter OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                />
                                <label>Enter OTP *</label>
                            </div>

                            <div className="d-flex gap-2">
                                <button
                                    type="button"
                                    className="btn btn-secondary text-white w-50"
                                    onClick={() => setRegisterStep(1)}
                                    disabled={isLoading}
                                >
                                    Change Mobile
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary w-50"
                                    disabled={isLoading || !otp.trim()}
                                >
                                    {isLoading ? "Verifying..." : "Verify OTP"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}
