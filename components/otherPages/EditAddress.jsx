"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Modal, Button, Form } from "react-bootstrap";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function EditAddress() {
    const [addresses, setAddresses] = useState([
        {
            id: -1,
            name: "",
            email: "",
            mobile: "",
            area: "",
            building: "",
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
                            province: "",
                            short_national_address: "",
                            isDefault: false,
                        },
                        parsed[1] || {
                            id: -1,
                            ...defaultUserInfo, // 👈 Use defaultUserInfo for the second fallback
                            area: "",
                            building: "",
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
                            province: "",
                            short_national_address: "",
                            isDefault: false,
                        },
                        {
                            id: -1,
                            ...defaultUserInfo, // 👈 Use defaultUserInfo when no addresses exist
                            area: "",
                            building: "",
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
        setShow(true);
    };

    const [errors, setErrors] = useState({}); // <-- added for inline validation

    const handleChange = (e) => {
        const { name, value, checked } = e.target;
        if (name === "isDefault") {
            setForm((f) => ({ ...f, isDefault: checked }));
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
                                    {addresses[idx].building},{" "}
                                    {addresses[idx].province}
                                </p>
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
                        <Form.Group className="mb-3">
                            <Form.Label className="text-uppercase text-xs fw-medium text-secondary">
                                City
                            </Form.Label>
                            <Form.Control
                                name="area"
                                value={form.area}
                                onChange={handleChange}
                                className="rounded-2 px-2 py-1"
                                isInvalid={!!errors.area} // <-- added
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.area}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="text-uppercase text-xs fw-medium text-secondary">
                                Full Address
                            </Form.Label>
                            <Form.Control
                                name="building"
                                value={form.building}
                                onChange={handleChange}
                                className="rounded-2 px-2 py-1"
                                isInvalid={!!errors.building} // <-- added
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.building}
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
                            ></Form.Control>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="text-uppercase text-xs fw-medium text-secondary">
                                Short National Address
                            </Form.Label>
                            <Form.Control
                                name="short_national_address"
                                value={form.short_national_address}
                                onChange={handleChange}
                                className="rounded-2 px-2 py-1"
                                isInvalid={!!errors.short_national_address}
                            ></Form.Control>
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
