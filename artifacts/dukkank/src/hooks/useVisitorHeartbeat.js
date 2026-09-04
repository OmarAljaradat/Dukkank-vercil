import { useEffect, useRef } from "react";

const SESSION_KEY = "dukkank_sid";
const INTERVAL_MS = 30_000;

function getOrCreateSessionId() {
    try {
        let sid = sessionStorage.getItem(SESSION_KEY);
        if (!sid) {
            sid = crypto.randomUUID
                ? crypto.randomUUID()
                : Math.random().toString(36).slice(2) + Date.now().toString(36);
            sessionStorage.setItem(SESSION_KEY, sid);
            return { sid, isNew: true };
        }
        return { sid, isNew: false };
    } catch {
        return { sid: "anon-" + Math.random().toString(36).slice(2), isNew: true };
    }
}

function detectSource() {
    try {
        const params = new URLSearchParams(window.location.search);
        const utm = params.get("utm_source");
        if (utm) return utm;
        const ref = document.referrer;
        if (!ref) return "direct";
        if (ref.includes("instagram")) return "instagram";
        if (ref.includes("twitter") || ref.includes("x.com")) return "twitter";
        if (ref.includes("facebook")) return "facebook";
        if (ref.includes("tiktok")) return "tiktok";
        if (ref.includes("google")) return "google";
        if (ref.includes("whatsapp")) return "whatsapp";
        return "referral";
    } catch {
        return "direct";
    }
}

async function sendHeartbeat(sid, source) {
    try {
        const deviceInfo = navigator.userAgent || "";
        const res = await fetch("/api/visitors/heartbeat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId: sid, source, deviceInfo }),
        });
        if (res.status === 403) {
            window.location.href = "about:blank";
        }
    } catch { /* silently ignore */ }
}

async function sendPageView(sid, source) {
    try {
        const deviceInfo = navigator.userAgent || "";
        const pageUrl = window.location.pathname + window.location.search;
        await fetch("/api/visitors/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                sessionId: sid,
                eventType: "page_view",
                eventTitle: "زيارة جديدة للموقع",
                eventData: { source },
                pageUrl,
                deviceInfo,
            }),
        });
    } catch { /* silently ignore */ }
}

export function useVisitorHeartbeat() {
    const { sid, isNew } = getOrCreateSessionId();
    const sidRef = useRef(sid);
    const isNewRef = useRef(isNew);
    const sourceRef = useRef(detectSource());

    useEffect(() => {
        const sid = sidRef.current;
        const source = sourceRef.current;

        // Send heartbeat immediately
        sendHeartbeat(sid, source);

        // If new session → send page_view to trigger Telegram notification
        if (isNewRef.current) {
            sendPageView(sid, source);
        }

        const id = setInterval(() => sendHeartbeat(sid, source), INTERVAL_MS);
        return () => clearInterval(id);
    }, []);
}
