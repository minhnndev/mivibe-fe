import LegalDocumentLayout, {
  type LegalSection,
} from "@/components/LegalDocumentLayout";
import { PRIVACY_POLICY_URL } from "@/pages/legalLinks";

const updatedAt = "May 27, 2026";

const sections: LegalSection[] = [
  {
    title: "Overview",
    body: [
      "This Privacy Policy explains how Mivibe collects, uses, stores, and protects information when you use the Mivibe app, website, and related creative tools. Mivibe is designed for photo and video editing, including presets, LUTs, color adjustments, and export workflows.",
      "By accessing or using Mivibe, you acknowledge the practices described in this Privacy Policy. If you do not agree, please stop using Mivibe.",
    ],
  },
  {
    title: "Information We Collect",
    body: [
      "We may collect information you provide directly, including your name, email address, profile information, subscription status, and any support requests or feedback you send to us.",
      "We may also collect technical and usage information such as device type, operating system, app version, language, IP-based general location, diagnostics, crash data, and feature interaction data to help us operate and improve Mivibe.",
      "When you use editing features, Mivibe may process photos, videos, LUTs, presets, and project data that you import or create. This processing is used to provide the requested product functionality. Unless you enable a sharing, cloud, sync, backup, or support feature, your creative media is not provided to third parties except as needed to run the service.",
    ],
  },
  {
    title: "How We Use Information",
    body: [
      "We use information to provide Mivibe, authenticate users, maintain subscriptions, enable editing features, support exports, respond to support requests, secure the service, and improve reliability and performance.",
      "We may also use aggregated or de-identified information to understand product usage trends, prioritize features, improve creative tools, and monitor system health.",
    ],
  },
  {
    title: "Photos, Videos, and Creative Content",
    body: [
      "You retain ownership of the photos, videos, captions, edits, LUTs, presets, and other creative materials you import, create, or export using Mivibe. Mivibe does not claim ownership of your content.",
      "If you choose to share exported content or connect Mivibe with other services, the privacy practices of those third parties apply to content after it leaves Mivibe. You are responsible for reviewing the privacy settings and terms of those services.",
    ],
  },
  {
    title: "How We Share Information",
    body: [
      "Mivibe does not sell your personal information. We may share limited information with service providers that support infrastructure, analytics, payments, authentication, storage, security, and customer support on our behalf.",
      "We may also disclose information if required by law, to protect the rights, safety, and security of Mivibe or other users, to investigate abuse, or in connection with a business transaction such as a merger, acquisition, financing, or asset sale.",
    ],
  },
  {
    title: "Subscriptions and Payments",
    body: [
      "Some Mivibe features may require payment. Transactions may be handled by mobile app stores or third-party payment processors. Mivibe does not receive full payment card details from those providers.",
      "Billing, renewals, cancellations, taxes, and refund rights may also be subject to the rules of the payment provider or app store you used for the purchase.",
    ],
  },
  {
    title: "Retention and Security",
    body: [
      "We retain information for as long as reasonably necessary to provide Mivibe, comply with legal obligations, resolve disputes, enforce agreements, and protect the service. Retention periods may vary based on the type of data and the feature involved.",
      "We use reasonable technical, administrative, and organizational safeguards intended to protect information. However, no system is completely secure, and we cannot guarantee absolute security.",
    ],
  },
  {
    title: "Your Rights and Choices",
    body: [
      "Depending on your location, you may have rights to access, correct, delete, export, or restrict the processing of certain personal information. You may also have the right to object to certain uses of your information.",
      "You can also manage device-level permissions such as access to photos, camera, microphone, notifications, and tracking through your operating system settings.",
    ],
  },
  {
    title: "Children",
    body: [
      "Mivibe is not directed to children under the minimum age required by applicable law. We do not knowingly collect personal information from children without appropriate authorization. If you believe a child has provided us with personal information, please contact us through the support options listed in Mivibe or on our website.",
    ],
  },
  {
    title: "Changes to This Privacy Policy",
    body: [
      "We may update this Privacy Policy from time to time to reflect product changes, legal requirements, or operational updates. When we do, we will post the updated version at this page and revise the effective date above.",
    ],
  },
  {
    title: "Contact",
    body: [
      "If you have questions about this Privacy Policy or about how Mivibe handles information, please contact us through the support options provided in the app or on the Mivibe website.",
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <LegalDocumentLayout
      title="Privacy Policy"
      description="How Mivibe handles account information, creative media, analytics, subscriptions, and your privacy choices."
      canonicalUrl={PRIVACY_POLICY_URL}
      alternatePath="/terms"
      alternateLabel="View Terms of Service"
      updatedAt={updatedAt}
      sections={sections}
    />
  );
}
