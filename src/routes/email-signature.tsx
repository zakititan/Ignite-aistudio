import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useMemo } from "react";
import {
  Mail,
  Copy,
  Check,
  Smartphone,
  Laptop,
  Sparkles,
  Phone,
  Globe,
  MapPin,
  Star,
  Download,
  Share2,
  ExternalLink,
  Code,
  Eye,
  Settings,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Callout } from "@/components/Callouts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/email-signature")({
  head: () => ({
    meta: [
      {
        title: "Professional HTML Email Signature Generator",
      },
      {
        name: "description",
        content:
          "Generate client-safe, responsive HTML email signatures with direct tap-to-call, logo monogram, and Google Review links for Gmail, Outlook, Apple Mail, and Titan.",
      },
      {
        property: "og:title",
        content: "Professional Email Signature Generator",
      },
      {
        property: "og:description",
        content:
          "Create email signatures that render on every device and turn everyday emails into local trust builders.",
      },
    ],
  }),
  component: EmailSignaturePage,
});

type TemplateType = "executive" | "corporate" | "local_hero" | "compact";

export function EmailSignaturePage() {
  const { state } = useStore();
  const b = state.business;

  // Form Fields initialized from Business Store
  const [fullName, setFullName] = useState("Alex Morgan");
  const [jobTitle, setJobTitle] = useState("Founder & General Manager");
  const [businessName, setBusinessName] = useState(
    b.businessName || b.name || "Apex Craft Services LLC",
  );
  const [emailAddress, setEmailAddress] = useState(
    b.businessEmail ||
      b.ownerContact ||
      `alex@${b.ownedDomain || b.preferredDomain || "apexcraft.com"}`,
  );
  const [phoneNumber, setPhoneNumber] = useState(
    b.phone || b.whatsappNumber || "+1 (555) 234-5678",
  );
  const [websiteUrl, setWebsiteUrl] = useState(
    `https://${b.ownedDomain || b.preferredDomain || "apexcraft.com"}`,
  );
  const [locationStr, setLocationStr] = useState(
    b.location || b.address || "Austin, Texas & Surrounding Areas",
  );
  const [slogan, setSlogan] = useState(
    b.description?.slice(0, 50) || "Trusted local service with guaranteed craftsmanship",
  );
  const [googleReviewUrl, setGoogleReviewUrl] = useState(
    `https://search.google.com/local/writereview?placeid=sample`,
  );
  const [includeReviewBadge, setIncludeReviewBadge] = useState(true);
  const [themeColor, setThemeColor] = useState("#2563eb");
  const [activeTemplate, setActiveTemplate] = useState<TemplateType>("local_hero");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [copiedRich, setCopiedRich] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);

  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Clean initials for fallback monogram
  const initials = useMemo(() => {
    if (fullName) {
      const parts = fullName.trim().split(" ");
      if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      return fullName.slice(0, 2).toUpperCase();
    }
    return businessName.slice(0, 2).toUpperCase();
  }, [fullName, businessName]);

  const domainFormatted = websiteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");

  // Generate Email-Client Compatible Clean Inline HTML
  const generateRawHtml = () => {
    if (activeTemplate === "executive") {
      return `
<table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #333333; line-height: 1.4; max-width: 500px;">
  <tr>
    <td style="padding-bottom: 8px;">
      <span style="font-size: 16px; font-weight: bold; color: #111827; letter-spacing: -0.2px;">${fullName}</span>
      <span style="color: #6b7280; font-size: 13px;"> | ${jobTitle}</span>
    </td>
  </tr>
  <tr>
    <td style="border-top: 2px solid ${themeColor}; padding-top: 8px; padding-bottom: 6px;">
      <strong style="color: ${themeColor}; font-size: 13px;">${businessName}</strong>
      ${slogan ? `<div style="color: #6b7280; font-size: 11px; margin-top: 2px;">${slogan}</div>` : ""}
    </td>
  </tr>
  <tr>
    <td style="font-size: 12px; color: #4b5563;">
      <a href="tel:${phoneNumber.replace(/\D/g, "")}" style="color: #111827; text-decoration: none; font-weight: 500;">📞 ${phoneNumber}</a>
      <span style="color: #d1d5db; margin: 0 6px;">•</span>
      <a href="mailto:${emailAddress}" style="color: ${themeColor}; text-decoration: none;">✉️ ${emailAddress}</a>
      <span style="color: #d1d5db; margin: 0 6px;">•</span>
      <a href="${websiteUrl}" style="color: #111827; text-decoration: none; font-weight: 500;">🌐 ${domainFormatted}</a>
    </td>
  </tr>
  ${
    includeReviewBadge
      ? `<tr>
    <td style="padding-top: 8px;">
      <a href="${googleReviewUrl}" target="_blank" style="display: inline-block; background-color: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 4px; padding: 4px 8px; color: #1f2937; text-decoration: none; font-size: 11px; font-weight: bold;">
        ⭐ ⭐ ⭐ ⭐ ⭐ <span style="color: #4b5563; font-weight: normal; margin-left: 4px;">Review us on Google</span>
      </a>
    </td>
  </tr>`
      : ""
  }
</table>`.trim();
    }

    if (activeTemplate === "corporate") {
      return `
<table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #333333; line-height: 1.4; max-width: 540px;">
  <tr>
    <td valign="top" style="padding-right: 14px;">
      <div style="width: 52px; height: 52px; background-color: ${themeColor}; border-radius: 8px; color: #ffffff; text-align: center; line-height: 52px; font-size: 18px; font-weight: bold; font-family: Arial, sans-serif;">
        ${initials}
      </div>
    </td>
    <td valign="top" style="border-left: 1px solid #e5e7eb; padding-left: 14px;">
      <div style="font-size: 15px; font-weight: bold; color: #111827;">${fullName}</div>
      <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">${jobTitle} • <strong style="color: ${themeColor};">${businessName}</strong></div>
      <div style="font-size: 12px; color: #4b5563; line-height: 1.5;">
        <div>📞 <a href="tel:${phoneNumber.replace(/\D/g, "")}" style="color: #111827; text-decoration: none;">${phoneNumber}</a></div>
        <div>✉️ <a href="mailto:${emailAddress}" style="color: ${themeColor}; text-decoration: none;">${emailAddress}</a></div>
        <div>🌐 <a href="${websiteUrl}" style="color: #111827; text-decoration: none;">${domainFormatted}</a> | 📍 ${locationStr}</div>
      </div>
      ${
        includeReviewBadge
          ? `<div style="margin-top: 8px;">
        <a href="${googleReviewUrl}" target="_blank" style="text-decoration: none; font-size: 11px; color: #2563eb; font-weight: bold;">
          ⭐ 5.0 Rated Local Business — Read or Leave a Review →
        </a>
      </div>`
          : ""
      }
    </td>
  </tr>
</table>`.trim();
    }

    if (activeTemplate === "compact") {
      return `
<table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #374151; line-height: 1.4;">
  <tr>
    <td>
      <strong style="color: #111827; font-size: 13px;">${fullName}</strong> | ${jobTitle} at <span style="color: ${themeColor}; font-weight: bold;">${businessName}</span>
    </td>
  </tr>
  <tr>
    <td style="color: #6b7280; font-size: 11px; padding-top: 2px;">
      📞 <a href="tel:${phoneNumber.replace(/\D/g, "")}" style="color: #374151; text-decoration: none;">${phoneNumber}</a> • ✉️ <a href="mailto:${emailAddress}" style="color: ${themeColor}; text-decoration: none;">${emailAddress}</a> • 🌐 <a href="${websiteUrl}" style="color: #374151; text-decoration: none;">${domainFormatted}</a>
    </td>
  </tr>
</table>`.trim();
    }

    // Default: local_hero
    return `
<table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #1f2937; line-height: 1.45; max-width: 520px;">
  <tr>
    <td style="padding-bottom: 6px;">
      <div style="font-size: 16px; font-weight: 800; color: #111827; letter-spacing: -0.2px;">${fullName}</div>
      <div style="font-size: 12px; color: ${themeColor}; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">${jobTitle} • ${businessName}</div>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom: 8px;">
      <table cellpadding="0" cellspacing="0" border="0" style="font-size: 12px; color: #4b5563;">
        <tr>
          <td style="padding-right: 12px;">📞 <a href="tel:${phoneNumber.replace(/\D/g, "")}" style="color: #111827; text-decoration: none; font-weight: 600;">${phoneNumber}</a></td>
          <td style="padding-right: 12px;">✉️ <a href="mailto:${emailAddress}" style="color: ${themeColor}; text-decoration: none;">${emailAddress}</a></td>
          <td>🌐 <a href="${websiteUrl}" style="color: #111827; text-decoration: none; font-weight: 600;">${domainFormatted}</a></td>
        </tr>
      </table>
      ${locationStr ? `<div style="font-size: 11px; color: #6b7280; margin-top: 4px;">📍 ${locationStr}</div>` : ""}
    </td>
  </tr>
  ${
    includeReviewBadge
      ? `<tr>
    <td style="padding-top: 4px;">
      <table cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 10px;">
        <tr>
          <td style="font-size: 11px; font-weight: bold; color: #b45309; padding-right: 6px;">★★★★★</td>
          <td style="font-size: 11px; color: #334155;">
            <a href="${googleReviewUrl}" target="_blank" style="color: #0f172a; font-weight: 600; text-decoration: none;">
              Rated 5 Stars on Google — <span style="color: ${themeColor}; text-decoration: underline;">Leave us a review</span>
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>`
      : ""
  }
</table>`.trim();
  };

  // Copy Formatted Signature (Rich text clipboard)
  const copyRichSignature = async () => {
    try {
      const html = generateRawHtml();
      const plainText = `${fullName}\n${jobTitle} | ${businessName}\nPhone: ${phoneNumber}\nEmail: ${emailAddress}\nWebsite: ${websiteUrl}\n${locationStr}`;

      if (navigator.clipboard && window.ClipboardItem) {
        const item = new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([plainText], { type: "text/plain" }),
        });
        await navigator.clipboard.write([item]);
      } else {
        // Fallback using selection
        const container = previewContainerRef.current;
        if (container) {
          const range = document.createRange();
          range.selectNode(container);
          window.getSelection()?.removeAllRanges();
          window.getSelection()?.addRange(range);
          document.execCommand("copy");
          window.getSelection()?.removeAllRanges();
        }
      }
      setCopiedRich(true);
      setTimeout(() => setCopiedRich(false), 2500);
      toast.success(
        "Formatted signature copied! Paste directly into Gmail, Outlook, or Apple Mail.",
      );
    } catch {
      toast.error("Could not write rich signature. Try copying raw HTML below.");
    }
  };

  // Copy Raw HTML
  const copyRawHtml = async () => {
    try {
      await navigator.clipboard.writeText(generateRawHtml());
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2500);
      toast.success("Copied clean HTML source code to clipboard!");
    } catch {
      toast.error("Could not copy HTML.");
    }
  };

  return (
    <AppShell
      title="Professional HTML Email Signature Generator"
      description="Create clean, responsive, email-client-safe signatures with direct tap-to-call, logo monogram, and Google Review links."
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={copyRawHtml} className="text-xs gap-1.5">
            <Code className="size-3.5" /> {copiedHtml ? "HTML Copied!" : "Copy HTML"}
          </Button>
          <Button
            size="sm"
            onClick={copyRichSignature}
            className="text-xs gap-1.5 bg-primary text-primary-foreground shadow"
          >
            {copiedRich ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copiedRich ? "Copied to Clipboard!" : "Copy Formatted Signature"}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <Callout tone="info" title="Build Customer Trust With Every Sent Email">
          Emails sent from your custom domain (e.g.{" "}
          <span className="font-mono">{emailAddress}</span>) combined with a branded signature look
          authoritative, prevent spam filters from dropping attachments, and make it easy for local
          clients to call you or leave a 5-star review.
        </Callout>

        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* LEFT COLUMN: Controls & Information Editor (6 cols) */}
          <div className="space-y-5 lg:col-span-6">
            {/* Template Selector */}
            <div className="surface-panel p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  1. Choose Signature Layout
                </span>
                <Badge variant="outline" className="text-[10px]">
                  Client Safe
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "local_hero", label: "Local Hero", desc: "5-Star Badge" },
                  { id: "corporate", label: "Corporate", desc: "Monogram Box" },
                  { id: "executive", label: "Executive", desc: "Top Accent" },
                  { id: "compact", label: "Compact", desc: "2-Line Minimal" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTemplate(t.id as TemplateType)}
                    className={cn(
                      "p-3 rounded-xl border text-left transition-all text-xs space-y-0.5",
                      activeTemplate === t.id
                        ? "border-primary bg-primary-soft/20 text-foreground font-bold shadow-sm"
                        : "border-border bg-card text-muted-foreground hover:border-primary/50",
                    )}
                  >
                    <div className="font-bold text-foreground text-xs">{t.label}</div>
                    <div className="text-[10px] text-muted-foreground">{t.desc}</div>
                  </button>
                ))}
              </div>

              {/* Color Accent Picker */}
              <div className="pt-2 flex items-center justify-between border-t border-border/60">
                <Label className="text-xs font-semibold">Brand Accent Color:</Label>
                <div className="flex items-center gap-2">
                  {["#2563eb", "#059669", "#7c3aed", "#d97706", "#dc2626", "#0f172a"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setThemeColor(c)}
                      style={{ backgroundColor: c }}
                      className={cn(
                        "size-5 rounded-full border-2 transition-transform",
                        themeColor === c
                          ? "border-foreground scale-110"
                          : "border-transparent opacity-80 hover:opacity-100",
                      )}
                    />
                  ))}
                  <input
                    type="color"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="size-6 rounded border cursor-pointer bg-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Business Contact Fields */}
            <div className="surface-panel p-5 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-primary block">
                2. Sender Profile & Contact Details
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Your Full Name</Label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="text-xs"
                    placeholder="Alex Morgan"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Job Title / Role</Label>
                  <Input
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="text-xs"
                    placeholder="Founder & General Manager"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Company / Business Name</Label>
                  <Input
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="text-xs"
                    placeholder="Apex Craft Services LLC"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Custom Email Address</Label>
                  <Input
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    className="text-xs"
                    placeholder="alex@apexcraft.com"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Inquiry Phone Number</Label>
                  <Input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="text-xs"
                    placeholder="+1 (555) 234-5678"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Website Address</Label>
                  <Input
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="text-xs"
                    placeholder="https://apexcraft.com"
                  />
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <Label className="text-xs font-semibold">Service Area / Location</Label>
                <Input
                  value={locationStr}
                  onChange={(e) => setLocationStr(e.target.value)}
                  className="text-xs"
                  placeholder="Austin, Texas & Surrounding Areas"
                />
              </div>

              {/* Review Badge Toggle */}
              <div className="pt-2 border-t border-border/60 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={includeReviewBadge}
                    onChange={(e) => setIncludeReviewBadge(e.target.checked)}
                    className="size-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="font-semibold text-foreground">
                    Include 5-Star Google Review Callout Badge
                  </span>
                </label>

                {includeReviewBadge && (
                  <div className="space-y-1 pl-6">
                    <Label className="text-[11px] text-muted-foreground">
                      Google Review Link / Place ID URL
                    </Label>
                    <Input
                      value={googleReviewUrl}
                      onChange={(e) => setGoogleReviewUrl(e.target.value)}
                      className="text-xs h-8"
                      placeholder="https://search.google.com/local/writereview?placeid=..."
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Live Interactive Mailbox Preview & Instructions (6 cols) */}
          <div className="space-y-5 lg:col-span-6">
            {/* Live Mailbox Simulator Box */}
            <div className="surface-panel p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    Live Client Preview
                  </span>
                  <h3 className="font-display text-base font-bold text-foreground">
                    Simulated Outgoing Email View
                  </h3>
                </div>

                <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("desktop")}
                    className={cn(
                      "p-1.5 rounded text-xs flex items-center gap-1",
                      previewDevice === "desktop"
                        ? "bg-card text-foreground shadow-xs font-bold"
                        : "text-muted-foreground",
                    )}
                  >
                    <Laptop className="size-3.5" /> Desktop
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("mobile")}
                    className={cn(
                      "p-1.5 rounded text-xs flex items-center gap-1",
                      previewDevice === "mobile"
                        ? "bg-card text-foreground shadow-xs font-bold"
                        : "text-muted-foreground",
                    )}
                  >
                    <Smartphone className="size-3.5" /> Mobile
                  </button>
                </div>
              </div>

              {/* Email Window Mockup */}
              <div
                className={cn(
                  "rounded-xl border border-border bg-card shadow-sm overflow-hidden transition-all mx-auto",
                  previewDevice === "mobile" ? "max-w-[340px]" : "w-full",
                )}
              >
                {/* Mock Header */}
                <div className="bg-muted/50 border-b border-border p-3 text-xs space-y-1.5 text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">To: customer@example.com</span>
                    <span className="text-[10px]">
                      {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div className="font-semibold text-foreground">
                    Subject: Estimate & Scope for Your Project
                  </div>
                </div>

                {/* Mock Body */}
                <div className="p-4 space-y-3 text-xs text-foreground/90">
                  <p>Hi Sarah,</p>
                  <p>
                    Thank you for reaching out to us. I have reviewed your request and attached the
                    detailed breakdown for your project. Please let me know if you have any
                    questions!
                  </p>
                  <p>Best regards,</p>

                  {/* RENDERED SIGNATURE CONTAINER */}
                  <div
                    ref={previewContainerRef}
                    className="pt-2 border-t border-border/40 mt-3"
                    dangerouslySetInnerHTML={{ __html: generateRawHtml() }}
                  />
                </div>
              </div>

              {/* Copy Buttons Bar */}
              <div className="pt-2 grid grid-cols-2 gap-2">
                <Button onClick={copyRichSignature} className="text-xs font-bold gap-1.5 shadow">
                  {copiedRich ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  {copiedRich ? "Copied!" : "1-Click Copy Formatted"}
                </Button>
                <Button variant="outline" onClick={copyRawHtml} className="text-xs gap-1.5">
                  <Code className="size-3.5" /> {copiedHtml ? "HTML Copied!" : "Copy Raw HTML"}
                </Button>
              </div>
            </div>

            {/* Step-by-Step Installation Guides */}
            <div className="surface-panel p-5 space-y-3">
              <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-1.5">
                <Settings className="size-4 text-primary" />
                <span>How to Install in 30 Seconds</span>
              </h3>

              <Tabs defaultValue="gmail" className="space-y-3">
                <TabsList className="grid grid-cols-4 p-1 text-[11px] h-8">
                  <TabsTrigger value="gmail" className="text-[11px]">
                    Gmail
                  </TabsTrigger>
                  <TabsTrigger value="outlook" className="text-[11px]">
                    Outlook
                  </TabsTrigger>
                  <TabsTrigger value="apple" className="text-[11px]">
                    Apple Mail
                  </TabsTrigger>
                  <TabsTrigger value="titan" className="text-[11px]">
                    Titan Mail
                  </TabsTrigger>
                </TabsList>

                <TabsContent
                  value="gmail"
                  className="text-xs text-muted-foreground space-y-1.5 p-1"
                >
                  <p>
                    1. Open <strong>Gmail Settings (⚙️)</strong> → Click{" "}
                    <strong>&quot;See all settings&quot;</strong>.
                  </p>
                  <p>
                    2. Scroll down to the <strong>Signature</strong> section and click{" "}
                    <strong>&quot;Create new&quot;</strong>.
                  </p>
                  <p>
                    3. Click <strong>&quot;Copy Formatted Signature&quot;</strong> above, then press{" "}
                    <strong>Ctrl+V / Cmd+V</strong> directly into the signature box.
                  </p>
                  <p>
                    4. Under <em>Signature defaults</em>, select your new signature for new emails
                    and replies, then click <strong>&quot;Save Changes&quot;</strong> at the bottom.
                  </p>
                </TabsContent>

                <TabsContent
                  value="outlook"
                  className="text-xs text-muted-foreground space-y-1.5 p-1"
                >
                  <p>
                    1. In <strong>Outlook (Web or Desktop)</strong>, go to{" "}
                    <strong>Settings → Mail → Compose and reply</strong>.
                  </p>
                  <p>
                    2. Click <strong>&quot;New signature&quot;</strong> and give it a name.
                  </p>
                  <p>
                    3. Click <strong>&quot;Copy Formatted Signature&quot;</strong> above and paste (
                    <strong>Ctrl+V / Cmd+V</strong>) into the editor.
                  </p>
                  <p>
                    4. Set as default for new messages and replies, then click <strong>Save</strong>
                    .
                  </p>
                </TabsContent>

                <TabsContent
                  value="apple"
                  className="text-xs text-muted-foreground space-y-1.5 p-1"
                >
                  <p>
                    1. Open <strong>Mail → Settings (Preferences) → Signatures</strong> tab.
                  </p>
                  <p>
                    2. Select your email account and click the <strong>&quot;+&quot;</strong>{" "}
                    button.
                  </p>
                  <p>
                    3. Paste the formatted signature. Uncheck{" "}
                    <em>&quot;Always match my default message font&quot;</em> to preserve styling.
                  </p>
                </TabsContent>

                <TabsContent
                  value="titan"
                  className="text-xs text-muted-foreground space-y-1.5 p-1"
                >
                  <p>
                    1. Log in to your <strong>Titan Webmail</strong> inbox.
                  </p>
                  <p>
                    2. Click the <strong>Settings icon (⚙️)</strong> in the top right →{" "}
                    <strong>Preferences → Signatures</strong>.
                  </p>
                  <p>
                    3. Click <strong>&quot;Add signature&quot;</strong>, paste the copied signature,
                    and toggle it as Default.
                  </p>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
