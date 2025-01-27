"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from 'next/navigation';

export default function VerifyOTP() {

  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [mobile, setMobile] = useState('');

  const validateMobile = (event) => {
    const { value } = event.currentTarget;
    setMobile(value);
  };

  async function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    if(mobile == '') {
     setError('Mobile Number is Required');
     setSuccess(null);
     setIsLoading(false);
     return;
   }
   const regex = /^\d{9}$/;
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/verifyOTP`, {
        method: 'POST',
        body: formData,
      })
 
      if (!response.ok) {
        throw new Error('Failed to submit the data. Please try again.');
      }
 
      // Handle response if necessary
      const data = await response.json();
      if(data.message.split(' ')[0] != 'Customer') {
        setError(data.message);
        setSuccess(null);
      } else {
        setSuccess(data.message);
        setError(null);
        localStorage.setItem('token', data.access_token);
        setTimeout(() => router.push('/'), 1000);
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
      <h2 className="d-none">Verify OTP</h2>
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
              onSubmit={onSubmit}
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
                <label>Mobile Number (Eg. 500000000)*</label>
              </div>

              <div className="pb-3"></div>

              <div className="form-floating mb-3">
                <input
                  name="otp"
                  type="number"
                  className="form-control form-control_gray"
                  id="customerPasswodInput"
                  placeholder="OTP *"
                  required
                />
                <label htmlFor="customerPasswodInput">OTP *</label>
              </div>              

              <button
                className="btn btn-primary w-100 text-uppercase"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Verify OTP'}
              </button>
            </form>
          </div>
        </div>
    </section>
  );
}
