// components/common/PrebookingWidget.jsx

"use client";
import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
// import styles from './PrebookingWidget.module.css'; // We will define these custom styles below
import { CiMail } from "react-icons/ci"; // Using a simple icon for the mail/form
import { Bounce, ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- Framer Motion Variants ---
const widgetVariants = {
    hidden: { opacity: 0, scale: 0.8, x: 50 },
    visible: { opacity: 1, scale: 1, x: 0, transition: { type: "spring", stiffness: 100, delay: 0.5 } },
};

const bubbleVariants = {
    hidden: { opacity: 0, y: 10, x: -10 },
    visible: { opacity: 1, y: 0, x: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: 10, x: -10, transition: { duration: 0.3 } },
};

const SERIES_OPTIONS = [
    { value: '2000', label: '2000 — The Roots' },
    { value: '2025', label: '2025 — The Alchemy Lab' },
    { value: '2050', label: '2050 — The Beyond' },
    { value: 'full-set', label: 'Full K-Series Collection' }
];

export default function PrebookingWidget({ showModal, setShowModal }) {
    const [showBubble, setShowBubble] = useState(true);
    const [selectedSeries, setSelectedSeries] = useState([]);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const[phone,setPhone]=useState('')

    const handleClose = () => {
        if (setShowModal) setShowModal(false);
        setName('');
        setEmail('');
        setSelectedSeries([]);
        setPhone('')
    };
    const handleShow = () => {
        if (setShowModal) setShowModal(true);
        setShowBubble(false);
    };

    const handleSeriesChange = (event) => {
        const { value, checked } = event.target;
        setSelectedSeries(prev => {
            if (checked) {
                // Add the value if checked
                return [...prev, value];
            } else {
                // Remove the value if unchecked
                return prev.filter(series => series !== value);
            }
        });
    };

    // Placeholder function for form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic validation: must select at least one series
        if (selectedSeries.length === 0) {
            toast.warn("Please select at least one interested series.");
            return;
        }
        const submissionData = {
            name,
            email,
            interestedSeries: selectedSeries, // Matches the expected key in the Laravel controller
            phone
        };
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/prebooking/submit`, { // Adjust the path if your API version/prefix is different
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'origin': origin,
                    // If Botble requires a CSRF token for API, you'd need to include it here:
                    // 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify(submissionData),
                cache: 'no-store',
            });

            const result = await response.json();

            if (response.ok) {
                console.log(result.message);
                toast.success(result.message);
                handleClose();
            } else {
                console.error('Submission Error:', result.message, result.errors);
                toast.error(`Error: ${result.message || 'Please check the console for details.'}`);
            }
        } catch (error) {
            console.error('Network Error:', error);
            toast.error('A network error occurred. Please try again.');
        }

        // console.log({ name, email, interestedSeries: selectedSeries });
        
        // Your form submission logic here (API call, validation)
        // console.log("Prebooking form submitted with multiple selections!");
        // handleClose();
    };

    useEffect(() => {
        // Hide the bubble after 3 seconds of initial show (since showBubble is initialized to true)
        const initialHideTimer = setTimeout(() => {
            setShowBubble(false);
        }, 3000); 

        // Set up the recurring interval (Total cycle time: 10000ms or 10s)
        const intervalId = setInterval(() => {
            // Show the bubble
            setShowBubble(true); 

            // Set a timer to hide it again after 3 seconds
            const hideTimer = setTimeout(() => {
                setShowBubble(false);
            }, 3000);

            // Cleanup the short timer (though setInterval takes care of the long one)
            return () => clearTimeout(hideTimer); 
            
        }, 10000); // 10000ms cycle (3s shown + 7s hidden)

        // Cleanup function for the component unmount
        return () => {
            clearTimeout(initialHideTimer);
            clearInterval(intervalId);
        };
    }, []);

    return (
        <>
            {/* --- Sticky Widget Container (Bottom Left) --- */}
            <motion.div
                className={styles.widgetContainer}
                variants={widgetVariants}
                initial="hidden"
                animate="visible"
                onClick={handleShow}
            >
                {/* --- Dialogue Bubble --- */}
                <AnimatePresence>
                    {showBubble && (
                        <motion.div 
                            className={styles.dialogueBubble}
                            variants={bubbleVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            Book <strong>Now</strong>.
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* --- Pre-Booking Button --- */}
                <button className={styles.widgetButton}>
                    <CiMail size={24} />
                    <span className="ms-2 d-none d-sm-inline">Book Now</span>
                </button>
            </motion.div>

            {/* --- Pre-Booking Modal --- */}
            <Modal show={!!showModal} onHide={handleClose} centered dialogClassName={styles.customModal}>
                <Modal.Header closeButton className={styles.modalHeader} closeVariant="white">
                    <Modal.Title className={styles.modalTitle}>K-Series Pre-Book</Modal.Title>
                </Modal.Header>
                <Modal.Body className={styles.modalBody}>
                    <p className="text-center" style={{color: "#f7e7ce "}}>Register your interest now to be the first to order and receive exclusive offers!</p>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="formName">
                            <Form.Label>Your Name</Form.Label>
                            <Form.Control 
                                type="text" 
                                placeholder="Enter name" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required 
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formEmail">
                            <Form.Label>Email address</Form.Label>
                            <Form.Control 
                                type="email" 
                                placeholder="Enter email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required 
                            />
                        </Form.Group>
                         <Form.Group className="mb-3" controlId="formEmail">
                            <Form.Label>Phone Number</Form.Label>
                            <Form.Control 
                                type="tel" 
                                placeholder="Enter your Phone Number " 
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required 
                            />
                        </Form.Group>
                        
                        <Form.Group className="mb-4" controlId="formSeriesInterest">
                            <Form.Label>Interested Series (Select all that apply)</Form.Label>
                            <Row>
                                {SERIES_OPTIONS.map(option => (
                                    <Col xs={12} key={option.value}>
                                        <Form.Check 
                                            type="checkbox"
                                            id={`series-${option.value}`}
                                            label={option.label}
                                            value={option.value}
                                            checked={selectedSeries.includes(option.value)}
                                            onChange={handleSeriesChange}
                                            className={styles.customCheckbox} // Add custom class for styling
                                        />
                                    </Col>
                                ))}
                            </Row>
                        </Form.Group>

                        <Button type="submit" className={`w-100 mt-3 ${styles.submitButton}`}>
                            Submit Pre-Booking
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
            {/* Toast container (dark theme) */}
          <ToastContainer
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={true}
            newestOnTop={true}
            closeOnClick={true}
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
            transition={Bounce}
            />
        </>
    );
}