import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Shield, Mail, Globe } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const LAST_UPDATED = "March 13, 2026";
const APP_NAME = "ApexCam";
const COMPANY_NAME = "ApexCam, operated by Apex View, registered in Israel";
const CONTACT_EMAIL = "privacy@apex-view.org";
const PRIVACY_PORTAL = "https://apex-view.org/privacy";

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <div className="mb-8">
      <h2 className="text-xs font-bold tracking-widest uppercase text-primary mb-3 ml-1">
        {title}
      </h2>
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        {children}
      </div>
    </div>
  );
}

function BodyText({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-sm text-muted-foreground leading-relaxed ${className}`}>
      {children}
    </p>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 mt-2 pl-1">
      <span className="text-primary text-sm leading-relaxed shrink-0">•</span>
      <span className="text-sm text-muted-foreground leading-relaxed">{children}</span>
    </div>
  );
}

function Subhead({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold text-primary tracking-wide uppercase mt-4 mb-2">
      {children}
    </p>
  );
}

interface DataRowProps {
  label: string;
  value: string;
  isLast?: boolean;
}

function DataRow({ label, value, isLast }: DataRowProps) {
  return (
    <div
      className={`flex gap-4 py-2.5 ${
        !isLast ? "border-b border-border/50" : ""
      }`}
    >
      <span className="w-36 shrink-0 text-sm font-semibold text-foreground">
        {label}
      </span>
      <span className="text-sm text-muted-foreground leading-snug">{value}</span>
    </div>
  );
}

export default function PrivacyPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        {/* Hero banner */}
        <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-background py-12 mb-10 border-b border-border">
          <div className="container mx-auto px-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <h1 className="text-4xl font-bold text-foreground mb-3">Privacy Policy</h1>
            <div className="flex items-center gap-2 text-sm text-primary font-medium">
              <Shield className="h-4 w-4" />
              <span>Last Updated: {LAST_UPDATED}</span>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 max-w-3xl">
          {/* Intro card */}
          <div className="mb-8 p-5 bg-primary/5 border border-primary/20 rounded-xl flex gap-3 items-start">
            <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              ApexCam, operated by Apex View, registered in Israel, is committed to protecting your privacy. By using the App, you consent to the collection and processing of your information as described in this Privacy Policy.
            </p>
          </div>

          <Section title="1. Information We Collect">
            <BodyText className="mb-2">We collect the following types of information to provide the App's functionality:</BodyText>

            <Subhead>Account Information</Subhead>
            <Bullet>Email address and full name (collected during account provisioning)</Bullet>
            <Bullet>Encrypted password (never stored in plaintext)</Bullet>
            <Bullet>Profile information provided by your organization</Bullet>

            <Subhead>Device &amp; Usage Data</Subhead>
            <Bullet>Device type, operating system version, and app version</Bullet>
            <Bullet>Camera server connection credentials (stored securely in device Keychain)</Bullet>
            <Bullet>Push notification tokens (for alert delivery)</Bullet>
            <Bullet>App settings and preferences (theme, language)</Bullet>

            <Subhead>Location Data</Subhead>
            <Bullet>
              <strong className="text-foreground">Fleet Management &amp; Background Tracking:</strong> We use precise GPS location and background location tracking exclusively to track your fleet's vehicles securely, calculate accurate distances between you and your fleet, and alert you of geofence crossings. This operates even when the app is in the background.
            </Bullet>
            <Bullet>
              <strong className="text-foreground">When it is collected:</strong> Location data is collected continuously while fleet tracking is active, both in the foreground and background.
            </Bullet>
            <Bullet>
              <strong className="text-foreground">Storage &amp; Protection:</strong> We do not persistently store your personal device's location. The fleet location data is encrypted in transit and protected using Role-Based Access Control and Row-Level Security via Supabase, ensuring only authorized personnel can view fleet locations.
            </Bullet>

            <Subhead>Camera &amp; Media</Subhead>
            <Bullet>Live video streams are transmitted directly between your device and your own camera server — we do not receive, store, or process your video content</Bullet>
            <Bullet>Photos and video clips saved to your device are stored locally only</Bullet>
            <Bullet>Users are solely responsible for ensuring that their use of cameras and surveillance devices complies with applicable privacy and surveillance laws in their jurisdiction.</Bullet>
          </Section>

          <Section title="2. How We Use Your Information">
            <DataRow label="Account Info" value="Authenticate you and manage your account" />
            <DataRow label="Location Data" value="Display camera/vehicle positions on the map" />
            <DataRow label="Push Tokens" value="Deliver real-time alerts and notifications from your cameras" />
            <DataRow label="Device Info" value="Ensure compatibility and improve app stability" />
            <DataRow label="Preferences" value="Remember your app settings across sessions" isLast />
            <BodyText className="mt-3">We do not use your data for advertising, profiling, or any purpose not listed above.</BodyText>
          </Section>

          <Section title="3. Information Sharing">
            <BodyText>
              We do <strong className="text-foreground">not</strong> sell, rent, or trade your personal information. We share limited data with the following service providers only as necessary to operate the App:
            </BodyText>
            <div className="mt-4 space-y-0">
              {[
                { name: "Supabase", use: "Stores your account credentials and profile data", retention: "Until account deletion" },
                { name: "Google Maps Platform", use: "Renders map tiles and geocoding for location display", retention: "Session only" },
                { name: "Firebase (Google)", use: "Delivers push notifications to your device", retention: "Token stored until revoked" },
              ].map((item, index, arr) => (
                <div
                  key={item.name}
                  className={`py-3 ${index < arr.length - 1 ? "border-b border-border/50" : ""}`}
                >
                  <p className="text-sm font-bold text-foreground mb-1">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.use}</p>
                  <p className="text-xs text-primary mt-1">Retention: {item.retention}</p>
                </div>
              ))}
            </div>
            <BodyText className="mt-3">
              We may disclose your information if required by law, court order, or to protect the rights, property, or safety of {APP_NAME}, its users, or the public.
            </BodyText>
          </Section>

          <Section title="4. Data Security">
            <BodyText>We take the security of your data seriously. The following measures are in place:</BodyText>
            <Bullet><strong className="text-foreground">Encryption in Transit:</strong> All data transmitted uses HTTPS/TLS encryption provided by the Apple operating system.</Bullet>
            <Bullet><strong className="text-foreground">Secure Storage:</strong> Sensitive credentials are stored in the iOS Keychain / Android Keystore — encrypted hardware-backed storage.</Bullet>
            <Bullet><strong className="text-foreground">No Custom Encryption:</strong> We rely exclusively on standard, OS-provided and IETF-standard encryption (TLS, DTLS/SRTP for WebRTC). No proprietary encryption algorithms are used.</Bullet>
            <Bullet><strong className="text-foreground">Access Controls:</strong> Your account data on Supabase is protected by row-level security. Only you can access your own data.</Bullet>
            <BodyText className="mt-3">
              No method of transmission over the internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee absolute security.
            </BodyText>
          </Section>

          <Section title="5. Data Retention">
            <BodyText>We retain your personal data only for as long as necessary to provide the service:</BodyText>
            <Bullet>Account data is retained until you delete your account</Bullet>
            <Bullet>Push notification tokens are removed when you sign out or revoke notification permissions</Bullet>
            <Bullet>Camera footage is stored on your own server infrastructure — we have no access or control over its retention</Bullet>
            <Bullet>Device preferences are stored locally on your device and removed when you uninstall the App</Bullet>
          </Section>

          <Section title="6. Your Rights">
            <BodyText>Depending on your location, you may have the following rights regarding your personal data:</BodyText>
            <Bullet><strong className="text-foreground">Access:</strong> Request a copy of the personal data we hold about you</Bullet>
            <Bullet><strong className="text-foreground">Rectification:</strong> Request correction of inaccurate data</Bullet>
            <Bullet><strong className="text-foreground">Erasure:</strong> Request deletion of your account and associated data</Bullet>
            <Bullet><strong className="text-foreground">Portability:</strong> Request your data in a portable format</Bullet>
            <Bullet><strong className="text-foreground">Notifications:</strong> Disable push notifications at any time in device Settings or within the App</Bullet>
            <Bullet><strong className="text-foreground">Location:</strong> Revoke location permission at any time in device Settings</Bullet>
            <BodyText className="mt-3">To exercise any of these rights, contact us at {CONTACT_EMAIL}. We will respond within 30 days.</BodyText>
          </Section>

          <Section title="7. Children's Privacy">
            <BodyText>
              {APP_NAME} is not intended for use by children under the age of 13 (or 16 in EU jurisdictions). We do not knowingly collect personal information from children under these ages.
            </BodyText>
            <BodyText className="mt-3">
              If you believe we have inadvertently collected information from a child, please contact us immediately at {CONTACT_EMAIL} and we will promptly delete such information.
            </BodyText>
          </Section>

          <Section title="8. Permissions Requested">
            <BodyText className="mb-2">The App requests the following device permissions and why:</BodyText>
            <DataRow label="Camera" value="Live streaming and video capture from connected devices" />
            <DataRow label="Microphone" value="Two-way audio in live stream sessions (WebRTC)" />
            <DataRow label="Location" value="Display GPS position of fleet vehicles on the map" />
            <DataRow label="Background Location" value="Continuous fleet tracking when explicitly enabled" />
            <DataRow label="Notifications" value="Deliver real-time camera alerts and motion events" />
            <DataRow label="Photo Library" value="Save captured photos and video clips to your device" isLast />
            <BodyText className="mt-3">
              You may revoke any permission at any time in your device Settings. Revoking a permission may limit related App functionality.
            </BodyText>
          </Section>

          <Section title="9. Cookies &amp; Tracking">
            <BodyText>
              The App does not use advertising cookies or cross-app tracking. We use only essential session tokens stored securely on your device to keep you authenticated. We do not track you across other apps or websites.
            </BodyText>
            <BodyText className="mt-3">
              The App complies with Apple's App Tracking Transparency (ATT) framework. No third-party advertising SDKs are included.
            </BodyText>
          </Section>

          <Section title="10. International Data Transfers">
            <BodyText>
              Your data may be processed on servers located outside your country of residence (for example, Supabase infrastructure may be hosted in various regions). By using the App, you consent to such transfers.
            </BodyText>
            <BodyText className="mt-3">
              Where applicable, we ensure data transfers comply with GDPR Standard Contractual Clauses or equivalent safeguards.
            </BodyText>
          </Section>

          <Section title="11. Changes to This Policy">
            <BodyText>
              We may update this Privacy Policy from time to time. When we do, we will update the "Last Updated" date at the top of this page and notify you in the App for material changes.
            </BodyText>
          </Section>

          <Section title="12. Contact Us">
            <BodyText>If you have any questions, concerns, or requests regarding this Privacy Policy:</BodyText>
            <div className="mt-4 p-4 bg-primary/5 border-l-4 border-primary rounded-r-lg space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span className="font-semibold text-foreground">Email:</span>
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">{CONTACT_EMAIL}</a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-primary shrink-0" />
                <span className="font-semibold text-foreground">Privacy Portal:</span>
                <a href={PRIVACY_PORTAL} target="_blank" rel="noreferrer" className="text-primary hover:underline">{PRIVACY_PORTAL}</a>
              </div>
              <div className="text-sm">
                <span className="font-semibold text-foreground">App:</span>{" "}
                <span className="text-muted-foreground">{APP_NAME}</span>
              </div>
            </div>
            <BodyText className="mt-4 italic">
              This Privacy Policy shall be governed by and interpreted in accordance with the laws of the State of Israel.
            </BodyText>
          </Section>

          <p className="text-center text-xs text-muted-foreground/50 mt-8">
            © {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
