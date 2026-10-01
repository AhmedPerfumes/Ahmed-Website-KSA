"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Modal, Button, Form } from "react-bootstrap";
import { useLocale } from "next-intl";
import { lookupShortAddress, isValidShortAddress } from "@/utlis/saudiAddress";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function EditAddress() {
    const locale = useLocale();
    const [lookupLoading, setLookupLoading] = useState(false);
    const [lookupStatus, setLookupStatus] = useState(null);
    const lookupDebounceRef = useRef(null);

    const [addresses, setAddresses] = useState([
        {
            id: -1,
            name: "",
            email: "",
            mobile: "",
            area: "",
            building: "",
            building_name: "",
            province: "",
            short_national_address: "",
            isDefault: false,
        },
        {
            id: -1,
            name: "",
            email: "",
            mobile: "",
            area: "",
            building: "",
            building_name: "",
            province: "",
            short_national_address: "",
            isDefault: false,
        },
    ]);
    const [show, setShow] = useState(false);
    const [editingIndex, setEditingIndex] = useState(0);
    const [form, setForm] = useState(addresses[0]);
    const [customerId, setCustomerId] = useState(null);

    // Fetch customer_id and addresses from localStorage / API
    useEffect(() => {
    if (typeof window === "undefined") return;

    const raw = localStorage.getItem("user");
    let customer_id = null;
    let defaultUserInfo = { name: "", email: "", mobile: "" }; // 👈 New object to store user info

    if (raw) {
        try {
            const user = JSON.parse(atob(raw));
            customer_id = user.id;
            // ⭐️ MODIFICATION: Extract name, email, and mobile from the decoded user object
            defaultUserInfo = {
                name: user.name || "",
                email: user.email || "",
                mobile: user.mobile || user.phone || "" // Use mobile or phone if available
            };
        } catch {}
    }
    setCustomerId(customer_id);

    if (customer_id) {
        fetch(`${API_BASE}api/customerAddressDetails`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ customer_id }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.addresses && data.addresses.length) {
                    // 🔹 Step 1: parse API response
                    const parsed = data.addresses.map((addr) => ({
                        id: addr.id,
                        name: addr.name || defaultUserInfo.name, // 👈 Apply user info as fallback
                        email: addr.email || defaultUserInfo.email, // 👈 Apply user info as fallback
                        mobile: addr.phone || defaultUserInfo.mobile, // 👈 Apply user info as fallback
                        area: addr.city || "",
                        building: addr.address || "",
                        building_name: addr.area || "", // DB area column stores Building data
                        province: addr.state || "",
                        short_national_address: addr.short_national_address || "",
                        isDefault: addr.is_default === 1,
                    }));

                    // 🔹 Step 2: check localStorage for last default
                    const stored = localStorage.getItem("address");
                    if (stored) {
                        try {
                            const def = JSON.parse(atob(stored));
                            parsed.forEach((a) => {
                                a.isDefault = a.id === def.id;
                                if (a.id === def.id && !a.building_name && def.area) {
                                    a.building_name = def.area;
                                }
                            });
                        } catch {}
                    }

                    // 🔹 Step 3: keep array of exactly 2, using defaultUserInfo for un-filled spots
                    setAddresses([
                        parsed[0] || {
                            id: -1,
                            ...defaultUserInfo, // 👈 Use defaultUserInfo for the first fallback
                            area: "",
                            building: "",
                            building_name: "",
                            province: "",
                            short_national_address: "",
                            isDefault: false,
                        },
                        parsed[1] || {
                            id: -1,
                            ...defaultUserInfo, // 👈 Use defaultUserInfo for the second fallback
                            area: "",
                            building: "",
                            building_name: "",
                            province: "",
                            short_national_address: "",
                            isDefault: false,
                        },
                    ]);
                } else {
                    // ⭐️ ADDITION: Handle case where API returns NO addresses
                    setAddresses([
                        {
                            id: -1,
                            ...defaultUserInfo, // 👈 Use defaultUserInfo when no addresses exist
                            area: "",
                            building: "",
                            building_name: "",
                            province: "",
                            short_national_address: "",
                            isDefault: false,
                        },
                        {
                            id: -1,
                            ...defaultUserInfo, // 👈 Use defaultUserInfo when no addresses exist
                            area: "",
                            building: "",
                            building_name: "",
                            province: "",
                            short_national_address: "",
                            isDefault: false,
                        },
                    ]);
                }
            })
            .catch(() => {
                /* handle fetch errors */
            });
    }
}, []);

    const openModal = (idx) => {
        setEditingIndex(idx);
        setForm(addresses[idx]);
        setLookupStatus(null);
        setLookupLoading(false);
        setShow(true);
    };

    const [errors, setErrors] = useState({}); // <-- added for inline validation

    const handleShortAddressLookup = async (codeToLookup) => {
        const code = (codeToLookup || "").trim().toUpperCase();
        if (!isValidShortAddress(code)) {
            setLookupStatus({
                success: false,
                message: locale === "ar" ? "رمز غير مكتمل (مثال: ABCD1234)" : "Enter 4 letters + 4 digits (e.g. ABCD1234)",
            });
            return;
        }

        setLookupLoading(true);
        setLookupStatus(null);

        try {
            const res = await lookupShortAddress(code, locale);
            if (res.isValid && res.city) {
                setForm((prev) => ({
                    ...prev,
                    short_national_address: code,
                    area: res.city,
                    province: res.city,
                    building_name: res.buildingNumber || prev.building_name,
                    building: [res.street, res.district].filter(Boolean).join(', ') || res.formattedAddress || prev.building,
                }));
                setErrors((prev) => {
                    const next = { ...prev };
                    delete next.short_national_address;
                    delete next.area;
                    delete next.province;
                    delete next.building;
                    return next;
                });
                setLookupStatus({
                    success: true,
                    message: locale === "ar"
                        ? `✓ تم التحقق: ${res.city}${res.district ? " - " + res.district : ""}`
                        : `✓ Verified: ${res.city}${res.district ? " - " + res.district : ""}`,
                });
            } else {
                setLookupStatus({
                    success: false,
                    message: res.message || (locale === "ar" ? "لم يتم العثور على عنوان لهذا الرمز" : "Address not found for this code"),
                });
            }
        } catch (e) {
            console.error(e);
            setLookupStatus({
                success: false,
                message: locale === "ar" ? "تعذر التحقق تلقائياً" : "Could not verify automatically",
            });
        } finally {
            setLookupLoading(false);
        }
    };

    const handleChange = (e) => {
        let { name, value, checked } = e.target;
        if (name === "isDefault") {
            setForm((f) => ({ ...f, isDefault: checked }));
        } else if (name === "short_national_address") {
            value = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
            setForm((f) => ({ ...f, [name]: value }));
            if (value.length === 8 && isValidShortAddress(value)) {
                clearTimeout(lookupDebounceRef.current);
                lookupDebounceRef.current = setTimeout(() => {
                    handleShortAddressLookup(value);
                }, 350);
            }
        } else {
            setForm((f) => ({ ...f, [name]: value }));
        }
    };

    // inside save function where we update localStorage
    const save = async () => {
        if (!customerId) return;

        // ✅ Validation inside save
        const newErrors = {};
        if (!form.area?.trim()) newErrors.area = "City is required";
        if (!form.building?.trim())
            newErrors.building = "Full Address is required";
        if (!form.province?.trim()) newErrors.province = "Province is required";
        if (!form.short_national_address?.trim()) newErrors.short_national_address = "Short National Address is required";
        if (!/^[A-Za-z]{4}[0-9]{4}$/.test(form.short_national_address)) newErrors.short_national_address = "Valid 8-digit Short National Address is required. Enter 4 letters followed by 4 numbers.";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors); // show inline errors
            return; // stop save
        }
        setErrors({}); // clear previous errors if valid

        const otherIndex = editingIndex === 0 ? 1 : 0;

        setAddresses((prev) => {
            const updated = [...prev];
            updated[editingIndex] = { ...form };

            if (form.isDefault) {
                updated[otherIndex] = {
                    ...updated[otherIndex],
                    isDefault: false,
                };
            }

            const defaultAddr = updated.find((addr) => addr.isDefault);
            if (defaultAddr) {
                localStorage.setItem(
                    "address",
                    btoa(
                        JSON.stringify({
                            id: defaultAddr.id,
                            name: defaultAddr.name,
                            email: defaultAddr.email,
                            phone: defaultAddr.mobile,
                            state: defaultAddr.province,
                            city: defaultAddr.area,
                            address: defaultAddr.building,
                            area: defaultAddr.building_name || "", // store building in area column
                            building_name: defaultAddr.building_name || "",
                            short_national_address: defaultAddr.short_national_address,
                            customer_id: customerId,
                            is_default: 1,
                        })
                    )
                );
            }

            return updated;
        });

        setShow(false);

        const token = localStorage.getItem('token');

        try {
            const resp = await fetch(`${API_BASE}api/customerAddressUpdate`, {
                method: "POST",
                headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
                body: JSON.stringify({
                    address_id: form.id,
                    customer_id: customerId,
                    name: form.name,
                    email: form.email,
                    mobile: form.mobile,
                    address: form.building,
                    area: form.building_name || "", // save building data in area column
                    building: form.building_name || "",
                    city: form.area,
                    state: form.province,
                    short_national_address: form.short_national_address,
                    is_default: form.isDefault ? 1 : 0,
                }),
            });
            const res = await resp.json();
            if (res?.message || res?.error) {
                if(res.error == 'Unauthorized' || res.message == 'Unauthorized') {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login_register';
                }
            }
        } catch (e) {
            console.error("API update failed", e);
        }
    };

    return (
        <>
            <div className="col-lg-9">
                <p className="sub-menu__title border-bottom mb-4">
                    Your Default address will be used at checkout
                </p>
                <div
                    className="d-flex gap-3 flex-column "
                    style={{ fontFamily: "inherit" }}
                >
                    {["Home Address", "Other Address"].map((label, idx) => (
                        <div
                            key={label}
                            className={`p-3 d-flex justify-content-between align-items-start rounded border ${
                                addresses[idx].isDefault
                                    ? "border-primary"
                                    : "border-light"
                            }`}
                        >
                            <div>
                                <h6 className="mb-1 fw-medium">{label}</h6>
                                <p className="mb-0 text-dark fw-bold">
                                    {addresses[idx].name}
                                </p>
                                <p className="mb-0 text-dark small">
                                    {addresses[idx].email} |{" "}
                                    {addresses[idx].mobile}
                                </p>
                                <p className="mb-0 text-dark small">
                                    {addresses[idx].area},{" "}
                                    {addresses[idx].building}
                                    {addresses[idx].building_name ? `, ${locale === "ar" ? "مبنى " : "Building "}${addresses[idx].building_name}` : ""},{" "}
                                    {addresses[idx].province}
                                </p>
                                {addresses[idx].short_national_address && (
                                    <p className="mb-0 text-dark small" style={{ color: "#b9a16b", fontWeight: 600 }}>
                                        📍 {addresses[idx].short_national_address}
                                    </p>
                                )}
                            </div>
                            <div className="text-end">
                                {addresses[idx].isDefault && (
                                    <span className="badge bg-secondary mb-2">
                                        Default delivery address
                                    </span>
                                )}
                                <br />
                                <Link
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        openModal(idx);
                                    }}
                                    className="fs-sm border-bottom"
                                >
                                    Edit
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Edit Modal */}
            <Modal
                style={{ fontFamily: "inherit" }}
                show={show}
                onHide={() => setShow(false)}
                centered
            >
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="h6 fw-semibold">
                        Edit {editingIndex === 0 ? "Home" : "Other"} Address
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body className="pt-1">
                    <Form>
                        {/* Short National Address with auto-verify */}
                        <Form.Group className="mb-3">
                            <Form.Label className="text-uppercase text-xs fw-medium text-secondary">
                                {locale === "ar" ? "العنوان الوطني المختصر *" : "Short National Address *"}
                            </Form.Label>
                            <div className="position-relative">
                                <Form.Control
                                    name="short_national_address"
                                    value={form.short_national_address || ""}
                                    onChange={handleChange}
                                    maxLength="8"
                                    className="rounded-2 px-2 py-1"
                                    isInvalid={!!errors.short_national_address}
                                    style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
                                />
                                {lookupLoading ? (
                                    <span style={{ position: "absolute", right: locale === "ar" ? "auto" : "10px", left: locale === "ar" ? "10px" : "auto", top: "50%", transform: "translateY(-50%)", fontSize: "0.72rem", color: "#b9a16b", fontWeight: 600 }}>
                                        ⏳ {locale === "ar" ? "تحقق…" : "Checking…"}
                                    </span>
                                ) : (
                                    <Button
                                        variant="link"
                                        size="sm"
                                        type="button"
                                        onClick={() => handleShortAddressLookup(form.short_national_address)}
                                        disabled={!form.short_national_address || form.short_national_address.length < 8}
                                        style={{
                                            position: "absolute",
                                            right: locale === "ar" ? "auto" : "6px",
                                            left: locale === "ar" ? "6px" : "auto",
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            textDecoration: "none",
                                            color: form.short_national_address?.length === 8 ? "#8a6c2d" : "#bbb",
                                            fontSize: "0.72rem",
                                            fontWeight: 700,
                                            padding: "2px 6px",
                                        }}
                                    >
                                        {locale === "ar" ? "تحقق وتعبئة" : "Verify & Fill"}
                                    </Button>
                                )}
                            </div>
                            {lookupStatus && (
                                <div style={{ fontSize: "0.72rem", marginTop: "3px", color: lookupStatus.success ? "#2e7d32" : "#d32f2f", fontWeight: 600 }}>
                                    {lookupStatus.message}
                                </div>
                            )}
                            {!lookupStatus && (
                                <Form.Text className="text-muted" style={{ fontSize: "0.68rem" }}>
                                    e.g. RCTB4359
                                </Form.Text>
                            )}
                            <Form.Control.Feedback type="invalid">
                                {errors.short_national_address}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="text-uppercase text-xs fw-medium text-secondary">
                                City
                            </Form.Label>
                            <Form.Control
                                name="area"
                                value={form.area}
                                onChange={handleChange}
                                className="rounded-2 px-2 py-1"
                                isInvalid={!!errors.area}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.area}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="text-uppercase text-xs fw-medium text-secondary">
                                Province
                            </Form.Label>
                            <Form.Control
                                name="province"
                                value={form.province}
                                onChange={handleChange}
                                className="rounded-2 px-2 py-1"
                                isInvalid={!!errors.province}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.province}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="text-uppercase text-xs fw-medium text-secondary">
                                Full Address *
                            </Form.Label>
                            <Form.Control
                                name="building"
                                value={form.building}
                                onChange={handleChange}
                                className="rounded-2 px-2 py-1"
                                isInvalid={!!errors.building}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.building}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="text-uppercase text-xs fw-medium text-secondary">
                                {locale === "ar" ? "المبنى (اختياري)" : "Building (Optional)"}
                            </Form.Label>
                            <Form.Control
                                name="building_name"
                                value={form.building_name || ""}
                                onChange={handleChange}
                                placeholder={locale === "ar" ? "رقم أو اسم المبنى" : "Building number or name"}
                                className="rounded-2 px-2 py-1"
                            />
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Check
                                type="checkbox"
                                name="isDefault"
                                label="Set as default"
                                checked={form.isDefault}
                                onChange={handleChange}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>

                <Modal.Footer className="border-0 pt-0">
                    <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => setShow(false)}
                    >
                        Cancel
                    </Button>
                    <Button variant="primary" size="sm" onClick={save}>
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
