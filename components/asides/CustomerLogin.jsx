"use client";

import { closeModalUserlogin } from "@/utlis/aside";
import Link from "next/link";
import { useEffect, useState } from "react";
// import { useRouter } from 'next/navigation';
import { useLocale } from "next-intl";

export default function CustomerLogin() {

  const locale = useLocale();
  useEffect(() => {
    const pageOverlay = document.getElementById("pageOverlay");

    pageOverlay.addEventListener("click", closeModalUserlogin);

    return () => {
      pageOverlay.removeEventListener("click", closeModalUserlogin);
    };
  }, []);

  // const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [mobile, setMobile] = useState('');

  const validateMobile = (event) => {
    const { value } = event.currentTarget;
    setMobile(value);
  };
 
  async function onRegister(event) {
    event.preventDefault();
    setIsLoading(true);
    if(mobile == '') {
      setError('Mobile Number is Required');
      setSuccess(null);
      setIsLoading(false);
      return;
    }
    const regex = /^\d{10}$/;
    if(!regex.test(mobile)) {
      setError('Invalid Mobile Number');
      setSuccess(null);
      setIsLoading(false);
      return;
    }
    setError(null);
    setSuccess(null);
 
    try {
      const formData = new FormData(event.currentTarget)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/signup`, {
        method: 'POST',
        body: formData,
      })
 
      if (!response.ok) {
        throw new Error('Failed to submit the data. Please try again.');
      }
 
      // Handle response if necessary
      const data = await response.json();
      if(data.message.split(' ')[0] != 'OTP') {
        setError(data.message);
        setSuccess(null);
      } else {
        setSuccess(data.message);
        setError(null);
        setTimeout(() => window.location.href=`/${locale}/verify-otp`, 1000);
      }
      // console.log(data);
    } catch (error) {
      // Capture the error message to display to the user
      setError(error.message);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function onLogin(event) {
    event.preventDefault();
    setIsLoading(true);
    if(mobile == '') {
      setError('Mobile Number is Required');
      setSuccess(null);
      setIsLoading(false);
      return;
    }
    const regex = /^\d{10}$/;
    if(!regex.test(mobile)) {
      setError('Invalid Mobile Number');
      setSuccess(null);
      setIsLoading(false);
      return;
    }
    setError(null);
    setSuccess(null);
 
    try {
      const formData = new FormData(event.currentTarget)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/signin`, {
        method: 'POST',
        body: formData,
      })
 
      if (!response.ok) {
        throw new Error('Failed to submit the data. Please try again.');
      }
 
      // Handle response if necessary
      const data = await response.json();
      if(data.message.split(' ')[0] != 'Login') {
        setError(data.message);
        setSuccess(null);
      } else {
        setSuccess(data.message);
        setError(null);
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', btoa(JSON.stringify(data.data)));
        setTimeout(() => window.location.href='/', 1000);
      }
      // console.log(data);
    } catch (error) {
      // Capture the error message to display to the user
      setError(error.message);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      id="userAside"
      className="aside aside_right overflow-hidden customer-forms "
    >
      <div className="customer-forms__wrapper d-flex position-relative">
        <div className="customer__login">
          <div className="aside-header d-flex align-items-center">
            <h3 className="text-uppercase fs-6 mb-0">Login</h3>
            <button
              onClick={() => closeModalUserlogin()}
              className="btn-close-lg js-close-aside ms-auto"
            />
          </div>
          {error ? <div style={{ color: 'red' }}>{error}</div> : <div style={{ color: 'green' }}>{success}</div>}
          <form onSubmit={onLogin} className="aside-content">
            <div className="form-floating mb-3">
              <input
                name="mobile"
                type="number"
                className="form-control form-control_gray"
                placeholder="Mobile Number"
                onChange={validateMobile}
                required
              />
              <label>Mobile Number (Eg. 0500000000)*</label>
            </div>
            <div className="pb-3" />
            <div className="form-label-fixed mb-3">
              <label className="form-label">Password *</label>
              <input
                name="password"
                className="form-control form-control_gray"
                type="password"
                placeholder="********"
                required
              />
            </div>
            {/* <div className="d-flex align-items-center mb-3 pb-2">
              <div className="form-check mb-0">
                <input
                  name="remember"
                  className="form-check-input form-check-input_fill"
                  type="checkbox"
                  defaultValue
                />
                <label className="form-check-label text-secondary">
                  Remember me
                </label>
              </div>
              <Link href="/reset_password" className="btn-text ms-auto">
                Lost password?
              </Link>
            </div> */}
            <button
              className="btn btn-primary w-100 text-uppercase"
              disabled={isLoading}
              >
              {isLoading ? 'Loading...' : 'Login'}
            </button>
            <div className="customer-option mt-4 text-center">
              <span className="text-secondary">No account yet?</span>{" "}
              <Link
                href={`/${locale}/login_register#register-tab`}
                className="btn-text js-show-register"
              >
                Create Account
              </Link>
            </div>
          </form>
        </div>
        <div className="customer__register">
          <div className="aside-header d-flex align-items-center">
            <h3 className="text-uppercase fs-6 mb-0">Create an account</h3>
            <button className="btn-close-lg js-close-aside btn-close-aside ms-auto" />
          </div>
          <form onSubmit={onRegister} className="aside-content">
            <div className="form-floating mb-4">
              <input
                name="name"
                type="text"
                className="form-control form-control_gray"
                placeholder="User Name"
              />
              <label>Username</label>
            </div>

            <div className="pb-1" />

            <div className="form-floating mb-4">
              <input
                name="email"
                type="email"
                className="form-control form-control_gray"
                placeholder="Email Address"
              />
              <label>Email Address *</label>
            </div>

            <div className="pb-1" />

            <div className="form-floating mb-4">
              <input
                name="mobile"
                type="number"
                className="form-control form-control_gray"
                placeholder="Mobile Number"
                onChange={validateMobile}
                required
              />
              <label>Mobile Number (Eg. 0500000000)*</label>
            </div>

            <div className="pb-1" />

            <div className="form-label-fixed mb-4">
              <label className="form-label">Password *</label>
              <input
                name="password"
                className="form-control form-control_gray"
                type="password"
                placeholder="********"
              />
            </div>
            <p className="text-secondary mb-4">
              Your personal data will be used to support your experience
              throughout this website, to manage access to your account, and for
              other purposes described in our privacy policy.
            </p>
            <button
              className="btn btn-primary w-100 text-uppercase"
              disabled={isLoading}
              >
              {isLoading ? 'Loading...' : 'Register'}
            </button>
            <div className="customer-option mt-4 text-center">
              <span className="text-secondary">Already have account?</span>
              <Link href="#" className="btn-text js-show-login">
                Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
