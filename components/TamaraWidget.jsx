import React, { useEffect, useRef, useState } from "react";

const TamaraWidget = ({ amount, inlineType, inlineVariant, locale }) => {
    const [isClient, setIsClient] = useState(false);
    const scriptLoadedRef = useRef(false);
    const widgetKey = `tamara-widget-${amount}`;

    useEffect(() => {
        setIsClient(true); // Prevent SSR

        window.tamaraWidgetConfig = {
            lang: locale || "en",
            country: "SA",
            publicKey: process.env.NEXT_PUBLIC_TAMARA_PUBLIC_KEY,
        };

        const scriptId = "tamara-widget-js";
        if (!document.getElementById(scriptId)) {
            const script = document.createElement("script");
            script.id = scriptId;
            script.src = "https://cdn.tamara.co/widget-v2/tamara-widget.js";
            script.async = true;
            script.onload = () => {
                scriptLoadedRef.current = true;
            };
            document.body.appendChild(script);
        } else {
            scriptLoadedRef.current = true;
        }
    }, [locale]);

    if (!isClient) return null; // Prevent rendering on server

    return (
        <tamara-widget
            key={widgetKey}
            type="tamara-summary"
            amount={amount}
            inline-type={inlineType}
            inline-variant={inlineVariant}
            config='{"theme":"light","badgePosition":"","showExtraContent":"","hidePayInX":false}'
        />
    );
};

export default TamaraWidget;
