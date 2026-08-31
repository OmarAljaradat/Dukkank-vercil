import { useState, useRef } from "react";
import { GAMES, SUBSCRIPTIONS } from "../../data/products";
import { lsGet, lsSet } from "../../lib/storage";
import { toast } from "sonner";
import { Download, Upload, RefreshCw, FileSpreadsheet } from "lucide-react";

const OVERRIDE_KEY = "product_overrides";

function exportGamesCSV() {
    const rows = [
        ["id", "name", "sub", "four", "five", "secondary", "cost", "available", "bestSeller"],
        ...GAMES.map((g) => [g.id, g.name, g.sub || "", g.four ?? "", g.five ?? "", g.secondary ?? "", g.cost ?? "", g.available ? "true" : "false", g.bestSeller ? "true" : "false"]),
    ];
    const csv = "\uFEFF" + rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const a   = document.createElement("a");
    a.href    = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    a.download = `games-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
}

function exportSubsCSV() {
    const rows = [["id", "subscriptionId", "subscriptionName", "durationLabel", "four", "five"]];
    SUBSCRIPTIONS.forEach((s) =>
        s.durations.forEach((d) =>
            rows.push([d.id, s.id, s.name, d.label, d.four ?? "", d.five ?? ""])
        )
    );
    const csv = "\uFEFF" + rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const a   = document.createElement("a");
    a.href    = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    a.download = `subscriptions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
}

function parseCSV(text) {
    const lines = text.trim().split("\n").filter(Boolean);
    if (lines.length < 2) return [];
    const headers = lines[0].split(",").map((h) => h.replace(/^"|"$/g, "").trim());
    return lines.slice(1).map((line) => {
        const vals = [];
        let inQ = false, cur = "";
        for (const ch of line) {
            if (ch === '"') inQ = !inQ;
            else if (ch === "," && !inQ) { vals.push(cur); cur = ""; }
            else cur += ch;
        }
        vals.push(cur);
        return Object.fromEntries(headers.map((h, i) => [h, vals[i]?.replace(/^"|"$/g, "").trim() || ""]));
    });
}

export default function ProductsCSVTab() {
    const [overrides, setOverrides] = useState(() => lsGet(OVERRIDE_KEY, {}));
    const fileRef = useRef(null);

    const importCSV = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const rows = parseCSV(ev.target.result);
                if (!rows.length || !rows[0].id) { toast.error("ملف غير صحيح — تأكد من تحميل ملف الألعاب"); return; }
                const newOverrides = { ...(lsGet(OVERRIDE_KEY, {})) };
                let count = 0;
                rows.forEach((row) => {
                    if (!row.id) return;
                    newOverrides[row.id] = {
                        four:        row.four      ? Number(row.four)      : null,
                        five:        row.five      ? Number(row.five)      : null,
                        available:   row.available === "true",
                        bestSeller:  row.bestSeller === "true",
                    };
                    count++;
                });
                lsSet(OVERRIDE_KEY, newOverrides);
                setOverrides(newOverrides);
                toast.success(`تم استيراد ${count} منتج ✅ — أعد تحديث الصفحة لتطبيق التغييرات`);
            } catch {
                toast.error("فشل تحليل الملف — تأكد من صيغة CSV");
            }
        };
        reader.readAsText(file, "UTF-8");
        e.target.value = "";
    };

    const clearOverrides = () => {
        lsSet(OVERRIDE_KEY, {});
        setOverrides({});
        toast.success("تم مسح جميع التعديلات المستوردة");
    };

    const overrideCount = Object.keys(overrides).length;

    return (
        <div className="space-y-5">
            <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-[hsl(var(--brand-blue-deep))]" />
                <h2 className="font-bold text-lg text-[hsl(var(--brand-ink))]">استيراد / تصدير المنتجات CSV</h2>
            </div>

            {/* Export */}
            <div className="rounded-2xl bg-white dark:bg-white/[0.04] border border-[hsl(var(--brand-ink))]/10 p-5 space-y-3">
                <h3 className="font-bold text-[hsl(var(--brand-ink))]">📥 تصدير المنتجات</h3>
                <p className="text-xs text-[hsl(var(--brand-ink))]/55">
                    حمّل الملف، عدّل الأسعار والتوفر في Excel، ثم أعد رفعه أدناه.
                </p>
                <div className="flex flex-wrap gap-3">
                    <button onClick={exportGamesCSV}
                        className="inline-flex items-center gap-2 px-4 h-10 rounded-xl bg-[hsl(var(--brand-blue-deep))] text-white text-sm font-bold">
                        <Download className="w-4 h-4" /> تصدير الألعاب
                    </button>
                    <button onClick={exportSubsCSV}
                        className="inline-flex items-center gap-2 px-4 h-10 rounded-xl border-2 border-[hsl(var(--brand-blue-deep))] text-[hsl(var(--brand-blue-deep))] text-sm font-bold">
                        <Download className="w-4 h-4" /> تصدير الاشتراكات
                    </button>
                </div>
            </div>

            {/* Import */}
            <div className="rounded-2xl bg-white dark:bg-white/[0.04] border border-[hsl(var(--brand-ink))]/10 p-5 space-y-3">
                <h3 className="font-bold text-[hsl(var(--brand-ink))]">📤 استيراد تعديلات الألعاب</h3>
                <p className="text-xs text-[hsl(var(--brand-ink))]/55">
                    الاستيراد يعدّل أسعار الألعاب وحالة التوفر فقط — لا يغيّر الاشتراكات.
                    التعديلات تُحفظ محلياً وتُطبَّق عند إعادة تحديث الصفحة.
                </p>
                <input ref={fileRef} type="file" accept=".csv" onChange={importCSV} className="hidden" />
                <button onClick={() => fileRef.current?.click()}
                    className="inline-flex items-center gap-2 px-4 h-10 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-bold">
                    <Upload className="w-4 h-4" /> رفع ملف CSV
                </button>

                {overrideCount > 0 && (
                    <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-center justify-between">
                        <div className="text-sm text-amber-800">
                            <span className="font-bold">{overrideCount} منتج</span> لديهم تعديلات مستوردة محفوظة محلياً
                        </div>
                        <button onClick={clearOverrides} className="text-xs text-amber-600 hover:text-amber-800 font-bold flex items-center gap-1">
                            <RefreshCw className="w-3.5 h-3.5" /> مسح الكل
                        </button>
                    </div>
                )}
            </div>

            {/* Preview table */}
            <div className="rounded-2xl bg-white dark:bg-white/[0.04] border border-[hsl(var(--brand-ink))]/10 overflow-hidden">
                <div className="px-5 py-3 border-b border-[hsl(var(--brand-ink))]/8 bg-[hsl(var(--brand-ink))]/[0.02]">
                    <span className="text-xs font-bold text-[hsl(var(--brand-ink))]/50 uppercase tracking-wider">
                        الألعاب الحالية ({GAMES.length})
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-[hsl(var(--brand-ink))]/8">
                                {["الاسم", "PS4", "PS5", "متوفر", "الأكثر مبيعاً"].map((h) => (
                                    <th key={h} className="text-right px-4 py-2.5 text-xs font-bold text-[hsl(var(--brand-ink))]/55">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {GAMES.map((g) => {
                                const ov = overrides[g.id] || {};
                                const four = ov.four !== undefined ? ov.four : g.four;
                                const five = ov.five !== undefined ? ov.five : g.five;
                                const avail = ov.available !== undefined ? ov.available : g.available;
                                const best  = ov.bestSeller !== undefined ? ov.bestSeller : g.bestSeller;
                                const changed = !!overrides[g.id];
                                return (
                                    <tr key={g.id} className={`border-b border-[hsl(var(--brand-ink))]/5 ${changed ? "bg-amber-50/50 dark:bg-amber-900/10" : ""}`}>
                                        <td className="px-4 py-2.5">
                                            <span className="font-semibold text-[hsl(var(--brand-ink))]">{g.name}</span>
                                            {changed && <span className="text-[10px] text-amber-600 mr-1.5">✏️ معدّل</span>}
                                        </td>
                                        <td className="px-4 py-2.5 text-[hsl(var(--brand-ink))]/70">{four ? `${four}$` : "—"}</td>
                                        <td className="px-4 py-2.5 text-[hsl(var(--brand-ink))]/70">{five ? `${five}$` : "—"}</td>
                                        <td className="px-4 py-2.5">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${avail ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                                {avail ? "✅ متوفر" : "❌ نافد"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2.5 text-center">{best ? "⭐" : "—"}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
