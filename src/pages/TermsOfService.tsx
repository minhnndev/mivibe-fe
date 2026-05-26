import LegalDocumentLayout, {
  type LegalSection,
} from "@/components/LegalDocumentLayout";
import { TERMS_URL } from "@/pages/legalLinks";

const updatedAt = "May 27, 2026";

const sections: LegalSection[] = [
  {
    title: "Acceptance of These Terms",
    body: [
      "These Terms of Service govern your use of Mivibe, including the app, website, presets, LUTs, subscriptions, and related creative tools. By using Mivibe, you agree to be bound by these Terms.",
      "If you use Mivibe on behalf of an organization, you represent that you have authority to bind that organization to these Terms.",
    ],
  },
  {
    title: "Using Mivibe",
    body: [
      "Mivibe grants you a limited, personal, non-exclusive, non-transferable, and revocable license to use the service for lawful purposes, subject to these Terms and any applicable platform rules.",
      "You are responsible for your account, your device, your login credentials, and your use of Mivibe. You must take reasonable steps to prevent unauthorized access.",
    ],
  },
  {
    title: "Your Content",
    body: [
      "You retain ownership of the content you import, create, edit, or export through Mivibe, including photos, videos, audio, text, and project files.",
      "You represent that you have all rights necessary to use that content with Mivibe and that your use of the service will not violate the rights of any person or entity.",
      "If you choose to upload, back up, sync, submit for support, or otherwise transmit content through Mivibe, you grant Mivibe the limited rights needed to host, process, transmit, reproduce, and display that content solely for operating and improving the requested service features.",
    ],
  },
  {
    title: "Mivibe Assets and Tools",
    body: [
      "Mivibe and its software, branding, interface design, presets, LUTs, effects, templates, and related assets are owned by Mivibe or its licensors and are protected by applicable intellectual property laws.",
      "Except where expressly permitted, you may not copy, sell, sublicense, redistribute, reverse engineer, decompile, extract, or use Mivibe assets to build a competing service.",
    ],
  },
  {
    title: "Purchases and Subscriptions",
    body: [
      "Certain features may require a paid subscription or one-time purchase. Pricing, trial availability, plan features, and renewal periods may change over time.",
      "If your subscription renews automatically, you are responsible for managing cancellations before renewal through the app store, payment provider, or account settings used for the purchase. Refunds are governed by applicable law and the rules of the relevant payment provider or app store.",
    ],
  },
  {
    title: "Acceptable Use",
    body: [
      "You may not use Mivibe to create, upload, edit, distribute, or facilitate unlawful, fraudulent, abusive, harassing, hateful, exploitative, sexually exploitative, or rights-infringing content or activity.",
      "You may not interfere with the operation of Mivibe, bypass security controls, scrape data, misuse support channels, overload systems, impersonate others, or attempt to access accounts or systems without authorization.",
    ],
  },
  {
    title: "Third-Party Services",
    body: [
      "Mivibe may rely on or integrate with third-party providers such as app stores, payment processors, analytics providers, hosting providers, or content-sharing destinations. Those third parties control their own services and may have separate terms and privacy practices.",
    ],
  },
  {
    title: "Service Availability and Changes",
    body: [
      "We may modify, suspend, discontinue, or restrict any part of Mivibe at any time. We may also suspend or terminate access if we believe you have violated these Terms, if required by law, or if necessary to protect users, Mivibe, or third parties.",
      "We do not guarantee that Mivibe will always be available, uninterrupted, secure, or error-free.",
    ],
  },
  {
    title: "Disclaimers",
    body: [
      "To the fullest extent permitted by law, Mivibe is provided on an as-is and as-available basis. We disclaim warranties of merchantability, fitness for a particular purpose, non-infringement, and uninterrupted operation.",
    ],
  },
  {
    title: "Limitation of Liability",
    body: [
      "To the fullest extent permitted by law, Mivibe and its owners, employees, contractors, partners, and licensors will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for lost profits, lost data, lost content, lost goodwill, or lost business opportunities arising from or related to your use of Mivibe.",
    ],
  },
  {
    title: "Changes to These Terms",
    body: [
      "We may revise these Terms from time to time. The updated version will be posted at this page with a revised effective date. Your continued use of Mivibe after the updated Terms become effective means you accept the revised Terms.",
    ],
  },
  {
    title: "Contact",
    body: [
      "If you have questions about these Terms, please contact us through the support options available in Mivibe or on the Mivibe website.",
    ],
  },
];

export default function TermsOfService() {
  return (
    <LegalDocumentLayout
      title="Terms of Service"
      description="The rules for using Mivibe, including subscriptions, content rights, creative assets, and service access."
      canonicalUrl={TERMS_URL}
      alternatePath="/privacy"
      alternateLabel="View Privacy Policy"
      updatedAt={updatedAt}
      sections={sections}
    />
  );
}
