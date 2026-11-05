"use client";
import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { useLocale, useTranslations } from "next-intl";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function MyDetails() {
  const locale = useLocale();
  const t = useTranslations("Account");
  const [details, setDetails] = useState({
    customer_name: "",
    customer_email: "",
    customer_mobile: "",
  });
  const [initialDetails, setInitialDetails] = useState({});
  const [customerId, setCustomerId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [edit, setEdit] = useState({
    customer_name: false,
    customer_email: false,
    customer_mobile: false,
    password: false,
  });
  const [values, setValues] = useState({
    customer_name: "",
    customer_email: "",
    customer_mobile: "",
    password: "",
    new_password: "",
    confirm_password: "",
  });

  const [saveDialog, setSaveDialog] = useState(false);
  const [verifyPassword, setVerifyPassword] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [fieldErrors, setFieldErrors] = useState({
    customer_email: "",
    customer_mobile: "",
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("user");
    if (raw) {
      try {
        const user = JSON.parse(atob(raw));
        setCustomerId(user.id);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (!customerId) return;
    setLoading(true);
    fetch(`${API_BASE}api/customerDetails`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customer_id: customerId }),
    })
      .then((res) => res.json())
      .then((json) => {
        setDetails({
          customer_name: json.customer_name || "",
          customer_email: json.customer_email || "",
          customer_mobile: json.customer_mobile || "",
        });
        setValues({
          customer_name: json.customer_name || "",
          customer_email: json.customer_email || "",
          customer_mobile: json.customer_mobile || "",
          password: "",
          new_password: "",
          confirm_password: "",
        });
        setInitialDetails({
          customer_name: json.customer_name || "",
          customer_email: json.customer_email || "",
          customer_mobile: json.customer_mobile || "",
        });

        const user = {
          id: customerId,
          name: json.customer_name || "",
          email: json.customer_email || "",
          phone: json.customer_mobile || "",
        };
        localStorage.setItem("user", btoa(JSON.stringify(user)));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [customerId]);

  const isEdited =
    values.customer_name !== initialDetails.customer_name ||
    values.customer_email !== initialDetails.customer_email ||
    values.customer_mobile !== initialDetails.customer_mobile ||
    (values.new_password && values.confirm_password);

  const startEdit = (field) => {
    setEdit((e) => ({ ...e, [field]: true }));
  };

  const cancelEdit = (field) => {
    setValues((v) => ({
      ...v,
      [field]: initialDetails[field] || "",
      new_password: "",
      confirm_password: "",
    }));
    setEdit((e) => ({ ...e, [field]: false }));
  };

  const handleChange = (field, value) => {
    setValues((v) => ({ ...v, [field]: value }));
  };

  const handleShowSave = () => {
    setVerifyPassword("");
    setError("");
    setSuccess("");
    setFieldErrors({ customer_email: "", customer_mobile: "" });
    setSaveDialog(true);
  };

  const handleSave = async () => {
    setSaveLoading(true);
    setError("");
    setSuccess("");
    setFieldErrors({ customer_email: "", customer_mobile: "" });

    if (values.new_password || values.confirm_password) {
      if (values.new_password.length < 6) {
        setError(t("errPwdShort"));
        setSaveLoading(false);
        return;
      }
      if (values.new_password !== values.confirm_password) {
        setError(t("errPwdMatch"));
        setSaveLoading(false);
        return;
      }
    }

    try {
      const passCheckResp = await fetch(`${API_BASE}api/customerPasswordCheck`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: customerId,
          customer_password: verifyPassword,
        }),
      });
      const passCheck = await passCheckResp.json();

      if (
        passCheck.message &&
        passCheck.message.toLowerCase().includes("incorrect password")
      ) {
        setError(t("errIncorrectPwd"));
        setSaveLoading(false);
        return;
      }
    } catch {
      setError(t("errVerifyPwd"));
      setSaveLoading(false);
      return;
    }

    const token = localStorage.getItem('token');

    try {
      const resp = await fetch(`${API_BASE}api/customerUpdate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
        body: JSON.stringify({
          customer_id: customerId,
          customer_name: values.customer_name,
          customer_email: values.customer_email,
          customer_mobile: values.customer_mobile,
          customer_password: values.new_password ? values.new_password : undefined,
        }),
      });
      const res = await resp.json();

    setFieldErrors({ customer_email: "", customer_mobile: "" });

    if (res.message !== 'Customer Updated Successfully') {
      if (res.error?.customer_mobile || (Array.isArray(res.customer_mobile) && res.customer_mobile.length > 0)) {
        setFieldErrors((f) => ({
          ...f,
          customer_mobile: t("mobileExists"),
        }));
      }
    if (res.error?.customer_email || (Array.isArray(res.customer_email) && res.customer_email.length > 0)) {
      setFieldErrors((f) => ({
        ...f,
        customer_email: t("emailExists"),
      }));
    }
    if(res?.error || res?.message) {
      if(res.error == 'Unauthorized' || res.message == 'Unauthorized') {
        setError(t("sessionExpired"));
        setSaveLoading(false);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = `/${locale}/login_register`;
      }
    }
  setError(t("dataExists"));
  setSaveLoading(false);
  return;
}

setDetails({
  customer_name: values.customer_name,
  customer_email: values.customer_email,
  customer_mobile: values.customer_mobile,
});
setInitialDetails({
  customer_name: values.customer_name,
  customer_email: values.customer_email,
  customer_mobile: values.customer_mobile,
});
const updatedUser = {
  id: customerId,
  name: values.customer_name,
  email: values.customer_email,
  phone: values.customer_mobile,
};
localStorage.setItem("user", btoa(JSON.stringify(updatedUser)));

setEdit({
  customer_name: false,
  customer_email: false,
  customer_mobile: false,
  password: false,
});
setValues((v) => ({
  ...v,
  password: "",
  new_password: "",
  confirm_password: "",
}));
setError("");
setSuccess(t("detailsUpdated"));
setTimeout(() => {
  setSaveDialog(false);
}, 2000);
setSaveLoading(false);
    } catch {
      setError(t("networkError"));
      setSaveLoading(false);
    }
  };

  const FIELDS = [
    { key: "customer_name", label: t("fieldName") },
    { key: "customer_email", label: t("fieldEmail") },
    { key: "customer_mobile", label: t("fieldMobile") },
    { key: "password", label: t("fieldPassword") },
  ];

  return (
    <div style={{ maxWidth: 520, margin: "60px auto" }}>
      <h2 className="section-head section-title text-uppercase fs-25 fw-medium text-center mb-4" style={{ letterSpacing: ".02em" }}>
        {t("detailsTitle")}
      </h2>
      <div>
        {FIELDS.map((f) => (
          <div key={f.key} className="d-flex align-items-center py-3" style={{ borderBottom: "1px solid #ececec" }}>
            <div style={{ flex: 2 }}>
              <div style={{ textTransform: "uppercase", fontSize: 17 }}>{f.label}</div>
              <div style={{ fontSize: 16, fontWeight: 400, marginTop: 1 }}>
                {edit[f.key] ? (
                  f.key === "password" ? (
                    <>
                      <Form.Control type="password" placeholder={t("newPassword")} className="mb-2"
                        value={values.new_password} onChange={(e) => handleChange("new_password", e.target.value)} autoFocus />
                      <Form.Control type="password" placeholder={t("confirmNewPassword")}
                        value={values.confirm_password} onChange={(e) => handleChange("confirm_password", e.target.value)} />
                      <div className="mt-1">
                        <Button size="sm" variant="link" onClick={() => cancelEdit("password")} style={{ textDecoration: "underline" }}>
                          {t("cancel")}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Form.Control value={values[f.key]} onChange={(e) => handleChange(f.key, e.target.value)} autoFocus />
                      {fieldErrors[f.key] && (
                        <div className="text-danger mt-1" style={{ fontSize: 14 }}>
                          {fieldErrors[f.key]}
                        </div>
                      )}
                      <div className="mt-1">
                        <Button size="sm" variant="link" onClick={() => cancelEdit(f.key)} style={{ textDecoration: "underline" }}>
                          {t("cancel")}
                        </Button>
                      </div>
                    </>
                  )
                ) : f.key === "password" ? (
                  <span>••••••••</span>
                ) : loading ? (
                  <span className="text-muted">{t("loading")}</span>
                ) : (
                  <bdi dir={f.key === "customer_name" ? undefined : "ltr"}>{values[f.key]}</bdi>
                )}
              </div>
            </div>
            <div style={{ flex: 1, textAlign: "end" }}>
              {!edit[f.key] && (
                <Button size="sm" variant="link" onClick={() => startEdit(f.key)} style={{ textDecoration: "underline" }}>
                  {t("edit")}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-4">
        <Button disabled={!isEdited} onClick={handleShowSave}>
          {t("saveChanges")}
        </Button>
      </div>

      <Modal show={saveDialog} onHide={() => setSaveDialog(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t("confirmSave")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && error != '' && <Alert variant="danger">{error}</Alert>}
          {success && success != '' && <Alert variant="success">{success}</Alert>}
          <Form.Group>
            <Form.Label>{t("enterCurrentPassword")}</Form.Label>
            <Form.Control
              type="password"
              value={verifyPassword}
              onChange={(e) => setVerifyPassword(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSaveDialog(false)}>
            {t("cancel")}
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saveLoading}>
            {saveLoading ? t("saving") : t("save")}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
