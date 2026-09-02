import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef, useMemo } from "react";
import QRCode from "qrcode";
import {
  Star,
  QrCode,
  Printer,
  Copy,
  Download,
  MessageSquare,
  Mail,
  Smartphone,
  Sparkles,
  Share2,
  Check,
  CheckCircle2,
  ExternalLink,
  Store,
  Layers,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Callout } from "@/components/Callouts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/review-kit")({
  head: () => ({
    meta: [
      {
        title: "Google Review Request Kit & Printable Counter Stand",
      },
      {
        name: "description",
        content:
          "Generate printable table stands, QR codes, pocket receipt cards, and post-service SMS/email review request templates to boost 5-star Google reviews.",
      },
      {
        property: "og:title",
        content: "Google Review Request Kit & Counter QR Generator",
      },
      {
        property: "og:description",
        content:
          "Turn happy local customers into 5-star Google Business reviews with ready-to-print counter QR stands and follow-up templates.",
      },
    ],
  }),
  component: ReviewKitPage,
});

export function ReviewKitPage() {
  const { state } = useStore();
  const b = state.business;

  const businessName = b.businessName || b.name || "Apex Craft Services";
  const domain = b.ownedDomain || b.preferredDomain || "apexcraft.com";
  const phone = b.phone || "+1 (555) 234-5678";

  // Google Review URL State
  const [reviewUrl, setReviewUrl] = useState(
    `https://search.google.com/local/writereview?placeid=sample-${domain.replace(/[^a-z0-9]/gi, "")}`,
  );
  const [headline, setHeadline] = useState("Loved your experience with us?");
  const [subheadline, setSubheadline] = useState(
    "Scan the QR code to leave a quick Google review. It takes 30 seconds and supports our local team!",
  );
  const [accentColor, setAccentColor] = useState("#2563eb");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  // Generate QR Code image
  useEffect(() => {
    if (!reviewUrl) return;
    QRCode.toDataURL(
      reviewUrl,
      {
        width: 480,
        margin: 2,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
      },
      (err, url) => {
        if (!err && url) {
          setQrDataUrl(url);
        }
      },
    );
  }, [reviewUrl]);

  // Download QR Image
  const downloadQrPng = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `google-review-qr-${domain}.png`;
    a.click();
    toast.success("Downloaded high-res Google Review QR Code (PNG)!");
  };

  // Copy template helper
  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard!`);
  };

  // SMS & Email Templates
  const smsTemplates = useMemo(
    () => [
      {
        id: "sms_instant",
        title: "1. Instant Post-Service Thank You (Same Day)",
        text: `Hi [Customer Name]! Thank you for choosing ${businessName} today. If you have 30 seconds, could you share how we did on Google? It really helps our local team: ${reviewUrl}`,
      },
      {
        id: "sms_friendly",
        title: "2. Casual Follow-Up (24-48 Hours Later)",
        text: `Hey [Customer Name], hope everything is looking great with your [Service/Order]! If you enjoyed your experience with ${businessName}, we'd be so grateful for a quick Google review: ${reviewUrl}`,
      },
      {
        id: "sms_discount",
        title: "3. VIP Referral & Review Thank-You",
        text: `Hi [Customer Name], thank you for trusting ${businessName}! As a local business, your feedback means the world. Drop us a quick 5-star review here: ${reviewUrl} — thank you for your support!`,
      },
    ],
    [businessName, reviewUrl],
  );

  const emailTemplate = useMemo(
    () => `Subject: How was your experience with ${businessName}?

Hi [Customer Name],

Thank you for choosing ${businessName}! We truly appreciate your business and hope we met or exceeded your expectations.

As a local business, online reviews help our neighbors discover our services. If you have 30 seconds, would you mind sharing your feedback with a quick Google review?

👉 Leave a 5-Star Review Here:
${reviewUrl}

If there was anything we could have done better, please reply directly to this email or call us at ${phone} so we can make it right.

Warm regards,

${businessName} Team
${domain}`,
    [businessName, reviewUrl, phone, domain],
  );

  return (
    <AppShell
      title="Google Review Request Kit & Printable Counter Stand"
      description="Turn happy local customers into 5-star Google Business reviews with ready-to-print counter QR stands and follow-up templates."
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={downloadQrPng} className="text-xs gap-1.5">
            <Download className="size-3.5" /> Download QR (PNG)
          </Button>
          <Button
            size="sm"
            onClick={() => window.print()}
            className="text-xs gap-1.5 bg-primary text-primary-foreground shadow"
          >
            <Printer className="size-3.5" /> Print Stand & Cards
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <Callout tone="info" title="Why Reviews Are Your #1 Growth Channel">
          Over 87% of local consumers read Google reviews before calling a contractor, clinic, or
          service business. Having 15+ recent 5-star reviews places your business directly into
          Google Maps&apos; top 3-pack search results.
        </Callout>

        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* LEFT COLUMN: Controls & Link Setup (5 cols) */}
          <div className="space-y-5 lg:col-span-5">
            <div className="surface-panel p-5 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-primary block">
                1. Google Review Link & Card Settings
              </span>

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">
                    Your Google Business Review Link / Place ID
                  </Label>
                  <Input
                    value={reviewUrl}
                    onChange={(e) => setReviewUrl(e.target.value)}
                    className="text-xs font-mono"
                    placeholder="https://g.page/r/.../review"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    💡 Find this in your <em>Google Business Profile</em> dashboard under{" "}
                    <strong>&quot;Ask for reviews&quot;</strong>.
                  </p>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Card Headline</Label>
                  <Input
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Supporting Call-to-Action</Label>
                  <Textarea
                    rows={2}
                    value={subheadline}
                    onChange={(e) => setSubheadline(e.target.value)}
                    className="text-xs"
                  />
                </div>

                {/* Accent Colors */}
                <div className="pt-2 flex items-center justify-between border-t border-border/60">
                  <Label className="text-xs font-semibold">Theme Color:</Label>
                  <div className="flex items-center gap-1.5">
                    {["#2563eb", "#059669", "#d97706", "#7c3aed", "#0f172a"].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setAccentColor(c)}
                        style={{ backgroundColor: c }}
                        className={cn(
                          "size-5 rounded-full border-2 transition-transform",
                          accentColor === c
                            ? "border-foreground scale-110"
                            : "border-transparent opacity-80 hover:opacity-100",
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Post-Service Follow-Up Copy Templates */}
            <div className="surface-panel p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  2. Outreach & Follow-Up Scripts
                </span>
                <Badge variant="outline" className="text-[10px]">
                  Copy & Paste
                </Badge>
              </div>

              <Tabs defaultValue="sms" className="space-y-3">
                <TabsList className="grid grid-cols-2 p-1 text-xs">
                  <TabsTrigger value="sms" className="text-xs gap-1.5">
                    <MessageSquare className="size-3.5" /> SMS Scripts
                  </TabsTrigger>
                  <TabsTrigger value="email" className="text-xs gap-1.5">
                    <Mail className="size-3.5" /> Email Template
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="sms" className="space-y-3">
                  {smsTemplates.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-xl border border-border bg-card space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-foreground">{t.title}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyText(t.text, t.title)}
                          className="h-6 text-[11px] px-2 gap-1"
                        >
                          <Copy className="size-3" /> Copy
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground bg-muted/40 p-2 rounded-lg font-mono">
                        {t.text}
                      </p>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="email" className="space-y-3">
                  <div className="p-3 rounded-xl border border-border bg-card space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-foreground">
                        Post-Job Email Follow-Up
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyText(emailTemplate, "Email Template")}
                        className="h-6 text-[11px] px-2 gap-1"
                      >
                        <Copy className="size-3" /> Copy
                      </Button>
                    </div>
                    <pre className="text-[11px] text-muted-foreground bg-muted/40 p-3 rounded-lg font-mono whitespace-pre-wrap leading-relaxed">
                      {emailTemplate}
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* RIGHT COLUMN: Printable Counter Stand & Pocket Card Mockups (7 cols) */}
          <div className="space-y-5 lg:col-span-7">
            {/* PRINTABLE COUNTER STAND CONTAINER */}
            <div className="surface-panel p-5 sm:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    Printable Display Preview
                  </span>
                  <h3 className="font-display text-base font-bold text-foreground">
                    Tabletop Counter Stand (5&quot; x 7&quot; / Letter)
                  </h3>
                </div>
                <Button size="sm" onClick={() => window.print()} className="text-xs gap-1.5 shadow">
                  <Printer className="size-3.5" /> Print This Card
                </Button>
              </div>

              {/* Physical Stand Card Visual */}
              <div
                id="printable-counter-stand"
                className="max-w-md mx-auto rounded-2xl border-4 border-foreground/10 bg-card p-6 sm:p-8 text-center space-y-4 shadow-xl relative overflow-hidden print:border-none print:shadow-none"
              >
                {/* Top Accent Strip */}
                <div
                  className="absolute top-0 left-0 right-0 h-3"
                  style={{ backgroundColor: accentColor }}
                />

                <div className="space-y-1 pt-2">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
                    {businessName}
                  </span>
                  <h2 className="font-display text-xl sm:text-2xl font-black text-foreground">
                    {headline}
                  </h2>
                </div>

                {/* 5 Big Gold Stars */}
                <div className="flex justify-center items-center gap-1.5 py-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-6 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Centered QR Code */}
                <div className="flex flex-col items-center justify-center p-3">
                  <div className="p-3 bg-white rounded-2xl border-2 border-slate-200 shadow-md">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt="Google Review QR Code"
                        className="size-48 sm:size-52 object-contain"
                      />
                    ) : (
                      <div className="size-48 flex items-center justify-center text-xs text-slate-400">
                        Generating QR Code...
                      </div>
                    )}
                  </div>
                  <span className="mt-2 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <QrCode className="size-3.5" /> Point Phone Camera to Scan
                  </span>
                </div>

                {/* Subtitle instructions */}
                <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                  {subheadline}
                </p>

                <div className="pt-2 border-t border-border/60 text-[11px] font-mono text-muted-foreground">
                  Official Review Link: <strong>{domain}</strong>
                </div>
              </div>
            </div>

            {/* Pocket Receipt Slip / Business Card Insert (3.5"x2") */}
            <div className="surface-panel p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Pocket Card / Receipt Insert (3.5&quot; x 2&quot;)
                </span>
                <Badge variant="outline" className="text-[10px]">
                  Bag / Invoice Drop
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3.5 shadow-sm">
                  {qrDataUrl && (
                    <img
                      src={qrDataUrl}
                      alt="Review QR"
                      className="size-16 rounded-lg border p-1 bg-white"
                    />
                  )}
                  <div className="space-y-1 flex-1 text-left">
                    <div className="flex text-amber-400 text-xs">★★★★★</div>
                    <h4 className="font-bold text-xs text-foreground">{businessName}</h4>
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      Scan to review our work on Google!
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4 flex flex-col justify-center text-center space-y-1.5">
                  <p className="text-xs font-bold text-foreground">
                    Slip inside customer bags & receipts
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Print on heavy cardstock or stick onto outgoing work orders.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
