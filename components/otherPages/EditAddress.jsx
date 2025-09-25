"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Modal, Button, Form } from "react-bootstrap";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function EditAddress() {
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      name: "",
      email: "",
      mobile: "",
      area: "",
      building: "",
      emirates: "",
      isDefault: false,
    },
    {
      id: -1,
      name: "",
      email: "",
      mobile: "",
      area: "",
      building: "",
      emirates: "",
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
  if (raw) {
    try {
      const user = JSON.parse(atob(raw));
      customer_id = user.id;
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
            name: addr.name || "",
            email: addr.email || "",
            mobile: addr.phone || "",
            area: addr.city || "",
            building: addr.address || "",
            emirates: addr.state || "",
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

          // 🔹 Step 3: keep array of exactly 2
          setAddresses([
            parsed[0] || {
              id: -1,
              name: "",
              email: "",
              mobile: "",
              area: "",
              building: "",
              emirates: "",
              isDefault: false,
            },
            parsed[1] || {
              id: -1,
              name: "",
              email: "",
              mobile: "",
              area: "",
              building: "",
              emirates: "",
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
  if (!form.area?.trim()) newErrors.area = "Area / Mantaqa is required";
  if (!form.building?.trim()) newErrors.building = "Building / Villa / Apartment is required";
  if (!form.emirates?.trim()) newErrors.emirates = "Emirate is required";

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
      updated[otherIndex] = { ...updated[otherIndex], isDefault: false };
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
            state: defaultAddr.emirates,
            city: defaultAddr.area,
            address: defaultAddr.building,
            customer_id: customerId,
            is_default: 1,
          })
        )
      );
    }

    return updated;
  });

  setShow(false);

  try {
    await fetch(`${API_BASE}api/customerAddressUpdate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        address_id: form.id,
        customer_id: customerId,
        name: form.name,
        email: form.email,
        mobile: form.mobile,
        address: form.building,
        city: form.area,
        state: form.emirates,
        is_default: form.isDefault ? 1 : 0,
      }),
    });
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
        <div className="d-flex gap-3 flex-column " style={{ fontFamily: "SofiaProRegular" }}>
          {["Home Address", "Other Address"].map((label, idx) => (
            <div
              key={label}
              className={`p-3 d-flex justify-content-between align-items-start rounded border ${
                addresses[idx].isDefault ? "border-primary" : "border-light"
              }`}
            >
              <div>
                <h6 className="mb-1 fw-medium">{label}</h6>
                <p className="mb-0 text-dark fw-bold">{addresses[idx].name}</p>
                <p className="mb-0 text-dark small">
                  {addresses[idx].email} | {addresses[idx].mobile}
                </p>
                <p className="mb-0 text-dark small">
                  {addresses[idx].area}, {addresses[idx].building},{" "}
                  {addresses[idx].emirates}
                </p>
              </div>
              <div className="text-end">
                {addresses[idx].isDefault && (
                  <span className="badge bg-secondary mb-2">Default delivery address</span>
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
      <Modal style={{ fontFamily: "SofiaProRegular" }} show={show} onHide={() => setShow(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="h6 fw-semibold">
            Edit {editingIndex === 0 ? "Home" : "Other"} Address
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="pt-1">
          <Form>
            <Form.Group className="mb-3">
  <Form.Label className="text-uppercase text-xs fw-medium text-secondary">
    Area / Mantaqa
  </Form.Label>
  <Form.Control
    name="area"
    value={form.area}
    onChange={handleChange}
    className="rounded-2 px-2 py-1"
    isInvalid={!!errors.area}   // <-- added
  />
  <Form.Control.Feedback type="invalid">{errors.area}</Form.Control.Feedback>
</Form.Group>

<Form.Group className="mb-3">
  <Form.Label className="text-uppercase text-xs fw-medium text-secondary">
    Building / Villa / Apartment
  </Form.Label>
  <Form.Control
    name="building"
    value={form.building}
    onChange={handleChange}
    className="rounded-2 px-2 py-1"
    isInvalid={!!errors.building}   // <-- added
  />
  <Form.Control.Feedback type="invalid">{errors.building}</Form.Control.Feedback>
</Form.Group>
            <Form.Group className="mb-3">
            <Form.Label className="text-uppercase text-xs fw-medium text-secondary">
              Emirates
            </Form.Label>
            <Form.Select
              name="emirates"
              value={form.emirates}
              onChange={handleChange}
              className="rounded-2 px-2 py-1"
              required
            >
              <option value="">Select Emirate...</option>
              <option value="Abu Dhabi">Abu Dhabi</option>
              <option value="Ajman">Ajman</option>
              <option value="Al Ain">Al Ain</option>
              <option value="Dubai">Dubai</option>
              <option value="Fujairah">Fujairah</option>
              <option value="Ras Al Khaymah">Ras Al Khaymah</option>
              <option value="Sharjah">Sharjah</option>
              <option value="Umm Al Quwain">Umm Al Quwain</option>
            </Form.Select>
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
