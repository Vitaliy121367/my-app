import { CSSProperties, FC, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

type AdBannerProps = {
    client?: string; // ваш AdSense client
    slot: string;    // ваш AdSense slot
    format?: "auto" | "rectangle" | "horizontal" | "vertical";
    style?: CSSProperties;
    responsive?: boolean;
    devMode?: boolean; // если true, показывает тестовый блок
};

declare global {
    interface Window {
        adsbygoogle: unknown[];
    }
}

const AdBanner: FC<AdBannerProps> = ({
    client,
    slot,
    format = "auto",
    style = { display: "block", width: "100%", height: "100px" },
    responsive = true,
    devMode = process.env.NODE_ENV !== "production", 
}) => {
    const adRef = useRef<HTMLModElement | null>(null);

    const location = useLocation();

    useEffect(() => {
        if (devMode) return;

        try {
            if (window.adsbygoogle && adRef.current) {
                window.adsbygoogle.push({});
            }
        } catch (e) {
            console.error("AdSense error:", e);
        }
    }, [location, devMode]);

    if (devMode) {
        return (
            <div
                style={{
                    ...style,
                    background: "#f0f0f0",
                    border: "2px dashed #999",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#666",
                    borderRadius: "10px",
                    textAlign: "center",
                }}
            >
                AD (DEV MODE)
            </div>
        );
    }

    return (
        <ins
            ref={adRef}
            className="adsbygoogle"
            style={style}
            data-ad-client={client}
            data-ad-slot={slot}
            data-ad-format={format}
            data-full-width-responsive={responsive ? "true" : "false"}
        />
    );
};

export default AdBanner;