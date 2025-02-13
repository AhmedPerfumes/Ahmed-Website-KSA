"use client";
import React, { useState } from "react";
import Link from "next/link";
// import { useRouter } from 'next/navigation';

import { useLocale } from "next-intl";

export default function LoginRegister() {

  // const router = useRouter();
  const locale = useLocale();
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
    <section className="login-register container">
      <h2 className="d-none">Login & Register</h2>
      <ul className="nav nav-tabs mb-5" id="login_register" role="tablist">
        <li className="nav-items" role="presentation">
          <Link
            className="nav-links nav-link_underscore active"
            id="login-tab"
            data-bs-toggle="tab"
            href="#tab-item-login"
            role="tab"
            aria-controls="tab-item-login"
            aria-selected="true"
          >
            Login
          </Link>
        </li>
        <li className="nav-items" role="presentation">
          <Link
            className="nav-links nav-link_underscore"
            id="register-tab"
            data-bs-toggle="tab"
            href="#tab-item-register"
            role="tab"
            aria-controls="tab-item-register"
            aria-selected="false"
          >
            Register
          </Link>
        </li>
      </ul>
      <div className="tab-content pt-2" id="login_register_tab_content">
        <div
          className="tab-pane fade show active"
          id="tab-item-login"
          role="tabpanel"
          aria-labelledby="login-tab"
        >
          {error ? <div style={{ color: 'red' }}>{error}</div> : <div style={{ color: 'green' }}>{success}</div>}

          <div className="pb-3"></div>

          <div className="login-form">
            <form
              onSubmit={onLogin}
              className="needs-validation"
            >
              <div className="form-floating mb-3">
                <input
                  name="mobile"
                  type="number"
                  className="form-control form-control_gray"
                  placeholder="Mobile Number *"
                  onChange={validateMobile}
                  required
                />
                <label>Mobile Number (Eg. 0500000000)*</label>
              </div>

              <div className="pb-3"></div>

              <div className="form-floating mb-3">
                <input
                  name="password"
                  type="password"
                  className="form-control form-control_gray"
                  id="customerPasswodInput"
                  placeholder="********"
                  required
                />
                <label htmlFor="customerPasswodInput">Password *</label>
              </div>

              {/* <div className="d-flex align-items-center mb-3 pb-2">
                <div className="form-check mb-0">
                  <input
                    name="remember"
                    className="form-check-input form-check-input_fill"
                    type="checkbox"
                    defaultValue=""
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
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Login'}
              </button>

              {/* <div className="customer-option mt-4 text-center">
                <span className="text-secondary">No account yet?</span>{" "}
                <Link href="#register-tab" className="btn-text js-show-register">
                  Create Account
                </Link>
              </div> */}
            </form>
          </div>
        </div>
        <div
          className="tab-pane fade"
          id="tab-item-register"
          role="tabpanel"
          aria-labelledby="register-tab"
        >

          {error ? <div style={{ color: 'red' }}>{error}</div> : <div style={{ color: 'green' }}>{success}</div>}

          <div className="pb-3"></div>

          <div className="register-form">
            <form
              onSubmit={onRegister}
              className="needs-validation"
            >
              <div className="form-floating mb-3">
                <input
                  name="name"
                  type="text"
                  className="form-control form-control_gray"
                  id="customerNameRegisterInput"
                  placeholder="User Name"
                  required
                />
                <label htmlFor="customerNameRegisterInput">User Name</label>
              </div>

              <div className="pb-3"></div>

              <div className="form-floating mb-3">
                <input
                  name="email"
                  type="email"
                  className="form-control form-control_gray"
                  id="customerEmailRegisterInput"
                  placeholder="Email Address *"
                  required
                />
                <label htmlFor="customerEmailRegisterInput">
                  Email address *
                </label>
              </div>

              <div className="pb-3"></div>

              <div className="form-floating mb-3">
                <input
                  name="mobile"
                  type="number"
                  className="form-control form-control_gray"
                  id="customerMobileInput"
                  placeholder="Mobile Number *"
                  onChange={validateMobile}
                  required
                />
                <label htmlFor="customerMobileInput">Mobile Number (Eg. 0500000000)*</label>
              </div>

              <div className="form-floating mb-3">
                <input
                  name="password"
                  type="password"
                  className="form-control form-control_gray"
                  id="customerPasswodRegisterInput"
                  placeholder="********"
                  required
                />
                <label htmlFor="customerPasswodRegisterInput">Password *</label>
              </div>

              <div className="d-flex align-items-center mb-3 pb-2">
                <p className="m-0">
                  Your personal data will be used to support your experience
                  throughout this website, to manage access to your account, and
                  for other purposes described in our privacy policy.
                </p>
              </div>

              <button
                className="btn btn-primary w-100 text-uppercase"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Register'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
