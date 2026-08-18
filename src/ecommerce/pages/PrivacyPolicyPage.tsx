import { PolicyLayout, PolicySection } from '../components/PolicyLayout';

export default function PrivacyPolicyPage() {
  return (
    <PolicyLayout
      title="Privacy Policy"
      subtitle="How MICCROTEN Technologies collects, uses, and safeguards your personal information."
      effectiveDate="1 August 2026"
    >
      <PolicySection number={1} title="Introduction">
        <p>
          MICCROTEN Technologies Pvt. Ltd. (&quot;MICCROTEN&quot;, &quot;we&quot;, &quot;us&quot;, or
          &quot;our&quot;) is committed to protecting the privacy of our customers, visitors, and users of
          our website, <strong>www.miccroten.com</strong> (the &quot;Website&quot;). This Privacy Policy
          explains how we collect, use, store, disclose, and protect your personal information when you
          access or use our Website, products, and services.
        </p>

        <p>
          This Privacy Policy is published in accordance with the Digital Personal Data Protection Act,
          2023 (DPDP Act) and other applicable laws and regulations of India. By accessing or using our
          Website, you acknowledge that you have read and understood this Privacy Policy and consent to the
          collection, use, storage, and disclosure of your personal information as described herein.
        </p>
      </PolicySection>

      <PolicySection number={2} title="Information We Collect">
        <p>
          We collect personal and non-personal information to provide, improve, and secure our Website,
          products, and services. The information we collect depends on how you interact with our Website.
        </p>

        <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mt-6 mb-3">
          2.1 Information You Provide
        </h3>

        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong className="text-gray-900">Account Information:</strong> Your name, email address,
            mobile number, password, and other information you provide when creating an account.
          </li>

          <li>
            <strong className="text-gray-900">Order &amp; Shipping Information:</strong> Your billing and
            shipping address, city, state, PIN code, contact number, and recipient details required to
            process and deliver your orders.
          </li>

          <li>
            <strong className="text-gray-900">Payment Information:</strong> Payment-related details required
            to complete your purchase. MICCROTEN does not store your complete debit/credit card details,
            UPI PIN, net banking credentials, or other sensitive payment information. Payments are securely
            processed through trusted third-party payment gateways that comply with applicable RBI
            regulations and industry security standards.
          </li>

          <li>
            <strong className="text-gray-900">Communications:</strong> Information you provide when you
            contact us through email, contact forms, WhatsApp, customer support, or when submitting product
            reviews, feedback, or inquiries.
          </li>

          <li>
            <strong className="text-gray-900">Documents &amp; Attachments:</strong> Any documents, images,
            or files voluntarily uploaded or shared with us for support requests, warranty claims,
            customization, or other services.
          </li>
        </ul>

        <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mt-6 mb-3">
          2.2 Information Collected Automatically
        </h3>

        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong className="text-gray-900">Device Information:</strong> IP address, browser type,
            operating system, device type, language preferences, and approximate geographic location.
          </li>

          <li>
            <strong className="text-gray-900">Usage Information:</strong> Pages visited, products viewed,
            search queries, referring URLs, clicks, session duration, and interactions with our Website.
          </li>

          <li>
            <strong className="text-gray-900">Cookies &amp; Similar Technologies:</strong> We use cookies,
            local storage, and similar technologies to remember your preferences, maintain your shopping
            cart, improve Website functionality, analyse traffic, and enhance your browsing experience.
          </li>

          <li>
            <strong className="text-gray-900">Log Information:</strong> We automatically collect server
            logs that help us monitor Website performance, detect security threats, troubleshoot issues,
            and prevent fraudulent activities.
          </li>
        </ul>
      </PolicySection>

      <PolicySection number={3} title="How We Use Your Information">
        <p>
          We use your personal information only for legitimate business purposes and to provide you with a
          safe, reliable, and seamless shopping experience. Specifically, we use your information to:
        </p>

        <ul className="list-disc pl-6 space-y-3">
          <li>
            <strong className="text-gray-900">Process Your Orders</strong> – To confirm, process, pack,
            ship, and deliver the products you purchase.
          </li>

          <li>
            <strong className="text-gray-900">Provide Customer Support</strong> – To answer your questions,
            resolve issues, process returns or refunds, and provide technical or product assistance.
          </li>

          <li>
            <strong className="text-gray-900">Keep You Updated</strong> – To send order confirmations,
            payment receipts, shipping updates, delivery notifications, and important account-related
            communications.
          </li>

          <li>
            <strong className="text-gray-900">Improve Our Website</strong> – To understand how visitors use
            our Website, improve performance, enhance user experience, and develop better products and
            services.
          </li>

          <li>
            <strong className="text-gray-900">Personalize Your Experience</strong> – To remember your
            preferences, shopping cart, and provide content or product recommendations relevant to your
            interests.
          </li>

          <li>
            <strong className="text-gray-900">Marketing &amp; Promotions</strong> – To send information
            about new products, special offers, and promotions only if you have chosen to receive such
            communications. You can unsubscribe at any time.
          </li>

          <li>
            <strong className="text-gray-900">Protect Our Platform</strong> – To detect fraud, prevent
            unauthorized access, monitor security, and safeguard our Website, customers, and business.
          </li>

          <li>
            <strong className="text-gray-900">Meet Legal Requirements</strong> – To comply with applicable
            laws, regulations, legal processes, and government requests in accordance with Indian law.
          </li>
        </ul>
      </PolicySection>

      <PolicySection number={4} title="Sharing of Your Information">
        <p>
          Your privacy is important to us. We do <strong>not</strong> sell, rent, or trade your personal
          information to anyone. We only share your information when it is necessary to provide our
          services or when required by law.
        </p>

        <ul className="list-disc pl-6 space-y-3">
          <li>
            <strong className="text-gray-900">Trusted Service Providers</strong> – We may share your
            information with trusted third-party service providers, such as payment gateways, shipping and
            logistics partners, cloud hosting providers, and customer support services, only to the extent
            necessary for them to perform their services on our behalf.
          </li>

          <li>
            <strong className="text-gray-900">Legal Requirements</strong> – We may disclose your
            information if required to comply with applicable laws, legal processes, court orders, or
            requests from government authorities, or to protect the rights, safety, and property of
            MICCROTEN, our customers, or others.
          </li>

          <li>
            <strong className="text-gray-900">Business Changes</strong> – If MICCROTEN undergoes a merger,
            acquisition, restructuring, or sale of assets, your information may be transferred as part of
            that transaction, subject to the protections outlined in this Privacy Policy.
          </li>

          <li>
            <strong className="text-gray-900">With Your Consent</strong> – We may share your information
            with third parties only when you have given us your explicit consent or requested us to do so.
          </li>
        </ul>
      </PolicySection>

      <PolicySection number={5} title="Data Security">
        <p>
          We take the security of your personal information seriously and implement appropriate technical
          and organizational measures to protect it from unauthorized access, misuse, alteration,
          disclosure, or loss.
        </p>

        <p>
          Our Website uses industry-standard security practices, including secure HTTPS (SSL/TLS)
          encryption, protected user authentication, secure cloud infrastructure, and restricted access
          to authorized personnel only. Payments made on our Website are processed through trusted
          third-party payment gateways using secure encryption. MICCROTEN does not store your complete
          debit/credit card details, UPI PIN, CVV, or other sensitive payment credentials.
        </p>

        <p>
          We regularly monitor and maintain our systems to help protect customer information and improve
          the security of our Website. While we take reasonable steps to safeguard your data, no method
          of electronic transmission or online storage can guarantee absolute security. Therefore, we
          encourage users to keep their account credentials confidential and notify us immediately if they
          suspect any unauthorized access to their account.
        </p>
      </PolicySection>

      <PolicySection number={6} title="Data Retention">
        <p>
          We retain your personal information only for as long as it is necessary to provide our
          services, fulfil your orders, comply with legal obligations, resolve disputes, and enforce our
          agreements.
        </p>

        <ul className="list-disc pl-6 space-y-3">
          <li>
            <strong className="text-gray-900">Account Information</strong> – Stored until your account is
            deleted or as required to provide our services.
          </li>

          <li>
            <strong className="text-gray-900">Order &amp; Transaction Records</strong> – Retained as
            required under applicable tax, accounting, and other legal obligations.
          </li>

          <li>
            <strong className="text-gray-900">Customer Support Records</strong> – May be retained for a
            reasonable period to resolve disputes, improve our services, and comply with legal
            requirements.
          </li>
        </ul>

        <p>
          Once your information is no longer required, we will securely delete, anonymize, or dispose of
          it in accordance with applicable laws.
        </p>
      </PolicySection>

      <PolicySection number={7} title="Your Privacy Rights">
        <p>
          In accordance with the Digital Personal Data Protection Act, 2023 (DPDP Act), you have certain
          rights regarding your personal information. We are committed to helping you exercise these
          rights whenever applicable.
        </p>

        <ul className="list-disc pl-6 space-y-3">
          <li>
            <strong className="text-gray-900">Access Your Information</strong> – Request details about
            the personal information we hold about you.
          </li>

          <li>
            <strong className="text-gray-900">Correct Your Information</strong> – Request updates or
            corrections if your personal information is inaccurate or incomplete.
          </li>

          <li>
            <strong className="text-gray-900">Delete Your Information</strong> – Request deletion of your
            personal information, subject to legal, regulatory, or contractual obligations.
          </li>

          <li>
            <strong className="text-gray-900">Withdraw Consent</strong> – Withdraw your consent for the
            processing of your personal information where consent is the legal basis.
          </li>

          <li>
            <strong className="text-gray-900">Manage Marketing Preferences</strong> – Opt out of
            promotional emails and marketing communications at any time by using the unsubscribe link or
            contacting us directly.
          </li>
        </ul>

        <p>
          To exercise any of these rights or if you have questions about your personal information,
          please contact us at{" "}
          <a
            href="mailto:miccroten03@gmail.com"
            className="text-primary-600 hover:text-primary-700"
          >
            miccroten03@gmail.com
          </a>.
        </p>
      </PolicySection>

      <PolicySection number={8} title="Cookies & Similar Technologies">
        <p>
          We use cookies and similar technologies to make our Website work efficiently, remember your
          preferences, improve your browsing experience, and better understand how visitors use our
          Website.
        </p>

        <ul className="list-disc pl-6 space-y-3">
          <li>
            <strong className="text-gray-900">Essential Cookies</strong> – Required for core Website
            functionality, such as user login, shopping cart, and secure checkout.
          </li>

          <li>
            <strong className="text-gray-900">Performance &amp; Analytics Cookies</strong> – Help us
            understand visitor behavior, monitor Website performance, and improve our products and
            services.
          </li>

          <li>
            <strong className="text-gray-900">Preference Cookies</strong> – Remember your language,
            settings, and other preferences to provide a more personalized experience.
          </li>

          <li>
            <strong className="text-gray-900">Marketing Cookies</strong> – May be used, with your
            consent, to provide relevant promotions, advertisements, or personalized content.
          </li>
        </ul>

        <p>
          You can manage or disable cookies through your browser settings. Please note that disabling
          certain cookies may affect the functionality and performance of our Website.
        </p>
      </PolicySection>

      <PolicySection number={9} title="Third-Party Websites">
        <p>
          Our Website may contain links to third-party websites, services, or platforms for your
          convenience. These websites operate independently and have their own privacy policies and
          practices.
        </p>

        <p>
          MICCROTEN is not responsible for the content, security, or privacy practices of any third-party
          websites. We encourage you to review their privacy policies before providing any personal
          information or using their services.
        </p>
      </PolicySection>

      <PolicySection number={10} title="Children's Privacy">
        <p>
          Our Website, products, and services are not intended for individuals under the age of 18. We do
          not knowingly collect personal information from children.
        </p>

        <p>
          If we become aware that personal information has been collected from a child without appropriate
          parental or legal guardian consent, we will take reasonable steps to delete such information as
          soon as possible. If you believe a child has provided us with personal information, please
          contact us immediately.
        </p>
      </PolicySection>

      <PolicySection number={11} title="Changes to This Privacy Policy">
        <p>
          We may update this Privacy Policy from time to time to reflect changes in our business,
          technology, legal requirements, or data processing practices.
        </p>

        <p>
          Any changes will be published on this page with an updated <strong>Effective Date</strong>.
          We encourage you to review this Privacy Policy periodically to stay informed about how we
          protect your information. Your continued use of our Website after any updates constitutes your
          acceptance of the revised Privacy Policy.
        </p>
      </PolicySection>

      <PolicySection number={12} title="Contact Us">
        <p>
          If you have any questions, concerns, or requests regarding this Privacy Policy or the way we
          collect, use, or protect your personal information, please feel free to contact us.
        </p>

        <ul className="list-none pl-0 space-y-3">
          <li>
            <strong className="text-gray-900">
              MICCROTEN Technologies Pvt. Ltd.
            </strong>
          </li>

          <li>
            <strong>Email:</strong>{" "}
            <a
              href="mailto:miccroten03@gmail.com"
              className="text-primary-600 hover:text-primary-700"
            >
              miccroten03@gmail.com
            </a>
          </li>


          <li>
            <strong>Contact:</strong>{" "}
            <a
              href="tel:+919207141737"
              className="text-primary-600 hover:text-primary-700"
            >
              +91 9207141737
            </a>
            {" | "}
            <a
              href="tel:+917795155237"
              className="text-primary-600 hover:text-primary-700"
            >
              +91 7795155237
            </a>
          </li>


          <li>
            <strong>Website:</strong>{" "}
            <a
              href="https://www.miccroten.com"
              className="text-primary-600 hover:text-primary-700"
              target="_blank"
              rel="noopener noreferrer"
            >
              www.miccroten.com
            </a>
          </li>

          <li>
            <strong>Address:</strong> New BEL Road, Venkatachari Nagar,
            R.M.V. Extension 2nd Stage, Bengaluru - 560094,
            Karnataka, India.
          </li>
        </ul>
      </PolicySection>
    </PolicyLayout>
  );
}
