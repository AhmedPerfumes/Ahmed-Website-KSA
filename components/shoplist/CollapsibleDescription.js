// CollapsibleDescription.js

"use client";
import React, { useState } from "react";
import { useLocale } from "next-intl";
import { Box, Container, Typography, Collapse } from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";

export default function CollapsibleDescription({ description, title: customTitle }) {
    const [expanded, setExpanded] = useState(false);
    const locale = useLocale();
    const isRtl = locale === "ar";
    const title = customTitle || (isRtl ? "عن هذه المجموعة" : "About this Collection");

    // If there's no description, don't render anything
    if (!description) {
        return null;
    }

    return (
        <Box
            component="section"
            dir={isRtl ? "rtl" : "ltr"}
            sx={{
                py: 3,
                background: "transparent",
                borderTop: "1px solid rgba(191, 149, 63, 0.15)",
                maxWidth: "930px",
                margin: "0 auto",
            }}
        >
            <Container maxWidth="lg">
                <Box sx={{ textAlign: isRtl ? "right" : "left", opacity: 0.85 }}>
                    <Typography
                        variant="caption"
                        sx={{
                            color: "#5C4A3A",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                            letterSpacing: "1.5px",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.5,
                            userSelect: "none",
                            textTransform: "uppercase",
                            transition: "color 0.3s ease",
                            "&:hover": { color: "#BF953F" }
                        }}
                        onClick={() => setExpanded(!expanded)}
                    >
                        {title} {expanded ? <KeyboardArrowUp sx={{ fontSize: "0.95rem" }} /> : <KeyboardArrowDown sx={{ fontSize: "0.95rem" }} />}
                    </Typography>

                    <Collapse in={expanded}>
                        <Box 
                            sx={{ 
                                mt: 2,
                                "& p, & div": {
                                    color: "#5C4A3A",
                                    display: "block",
                                    fontSize: "0.75rem",
                                    mb: 1.5,
                                    lineHeight: 1.6,
                                    textAlign: "justify",
                                    fontFamily: "Merriweather, serif",
                                },
                                "& span": {
                                    display: "inline",
                                },
                                "& a": {
                                    color: "#BF953F",
                                    textDecoration: "underline",
                                    textUnderlineOffset: "2px",
                                    fontWeight: "600",
                                    display: "inline",
                                },
                                "& a span, & span a": {
                                    display: "inline",
                                }
                            }}
                        >
                            <div dangerouslySetInnerHTML={{ __html: description }} />
                        </Box>
                    </Collapse>
                </Box>
            </Container>
        </Box>
    );
}