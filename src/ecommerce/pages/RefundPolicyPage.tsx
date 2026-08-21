import { PolicyLayout, PolicySection } from '../components/PolicyLayout';

export default function RefundPolicyPage() {
  return (
    <PolicyLayout
      title="Refund Policy"
      subtitle="Our commitment to fair and transparent refunds for your MICCROTEN purchases."
      effectiveDate="1 August 2026"
    >
      <PolicySection number={1} title="Introduction">
        <p>
          At <strong>MICCROTEN Technologies Pvt. Ltd.</strong>, customer satisfaction is important to us.
          This Refund Policy explains the conditions under which products purchased through
          <strong> www.miccroten.com</strong> may be returned, replaced, cancelled, or refunded.
        </p>

        <p>
          This Refund Policy applies to all purchases made through our Website and should be read together
          with our Terms &amp; Conditions and Privacy Policy. By placing an order on our Website, you
          acknowledge that you have read, understood, and agreed to this Refund Policy.
        </p>

        <p>
          This policy is published in accordance with the applicable provisions of the Consumer Protection
          Act, 2019, the Consumer Protection (E-Commerce) Rules, 2020, and other applicable laws of
          India.
        </p>
      </PolicySection>

      <PolicySection number={2} title="Eligibility for Returns & Refunds">
        <p>
          We accept return and refund requests only under the circumstances listed below. To be eligible,
          you must notify us within <strong>7 days</strong> of receiving your order and provide your order
          number along with clear photographs or videos, where applicable.
        </p>

        <ul className="list-disc pl-6 space-y-3">
          <li>
            <strong className="text-gray-900">Damaged Product</strong> – The product was damaged during
            shipping or arrived in a damaged condition.
          </li>

          <li>
            <strong className="text-gray-900">Defective Product</strong> – The product has a manufacturing
            defect or does not function as intended upon delivery.
          </li>

          <li>
            <strong className="text-gray-900">Incorrect Product</strong> – You received a product that is
            different from the one you ordered.
          </li>

          <li>
            <strong className="text-gray-900">Missing Items</strong> – One or more items from your order
            were missing when the package was delivered.
          </li>

          <li>
            <strong className="text-gray-900">Order Cancellation Before Dispatch</strong> – Orders
            cancelled before shipment are generally eligible for a full refund.
          </li>

          <li>
            <strong className="text-gray-900">Lost or Undelivered Orders</strong> – If your order is
            confirmed as lost in transit or cannot be delivered due to courier-related issues, we will
            arrange a replacement or process a refund after verification.
          </li>
        </ul>
      </PolicySection>

      <PolicySection number={3} title="Non-Returnable & Non-Refundable Products">
        <p>
          Unless required by applicable law, refunds or returns will not be accepted in the following
          situations:
        </p>

        <ul className="list-disc pl-6 space-y-3">
          <li>
            Products that have been used, installed, soldered, programmed, modified, or physically
            damaged after delivery.
          </li>

          <li>
            Products returned without their original packaging, accessories, manuals, labels, or proof of
            purchase.
          </li>

          <li>
            Products damaged due to improper installation, incorrect wiring, misuse, accidents,
            unauthorized repairs, voltage fluctuations, reverse polarity, liquid damage, or neglect.
          </li>

          <li>
            Custom-built, made-to-order, personalized, programmed, or specially manufactured products,
            including customized RFID tags, embedded systems, PCB assemblies, IoT solutions, and other
            products developed specifically for customer requirements.
          </li>

          <li>
            Software licenses, digital downloads, firmware, activation keys, or any downloadable digital
            content that has already been delivered or activated.
          </li>

          <li>
            Return requests submitted after the applicable return period without a valid reason covered
            under this Refund Policy.
          </li>

          <li>
            Returns requested solely due to a change of mind, incorrect product selection, or compatibility
            issues after purchase, unless otherwise specified on the product page.
          </li>
        </ul>
      </PolicySection>

      <PolicySection number={4} title="Return Process">
        <p>
          If your product is eligible for a return or refund, please follow the steps below:
        </p>

        <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mt-6 mb-3">
          Step 1: Submit a Return Request
        </h3>

        <p>
          Contact our support team within <strong>7 days</strong> of receiving your order. Please provide
          your order number, a description of the issue, and clear photographs or videos (if applicable)
          to help us verify your request.
        </p>

        <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mt-6 mb-3">
          Step 2: Request Review
        </h3>

        <p>
          Our team will review your request and may contact you for additional information if required.
          Once approved, we will provide return instructions or arrange a reverse pickup where available.
        </p>

        <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mt-6 mb-3">
          Step 3: Return & Inspection
        </h3>

        <p>
          Returned products must be securely packed in their original packaging along with all accessories,
          manuals, and included items. After we receive the product, it will be inspected to verify that
          it meets the conditions of this Refund Policy.
        </p>

        <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mt-6 mb-3">
          Step 4: Resolution
        </h3>

        <p>
          If your return is approved after inspection, we will process a refund, replacement, repair, or
          other appropriate resolution, depending on the nature of the issue and the product involved.
        </p>
      </PolicySection>

      <PolicySection number={5} title="Refund Process">
        <p>
          Approved refunds will be processed using the original payment method whenever possible. The
          exact time required for the refund to appear in your account depends on your bank, payment
          gateway, or financial institution.
        </p>

        <ul className="list-disc pl-6 space-y-3">
          <li>
            <strong className="text-gray-900">Online Payments</strong> – Refunds for UPI, credit cards,
            debit cards, net banking, and other online payment methods will generally be credited back to
            the original payment source.
          </li>

          <li>
            <strong className="text-gray-900">Bank Transfers</strong> – Where applicable, refunds may be
            processed via bank transfer after verifying the required account details.
          </li>

          <li>
            <strong className="text-gray-900">Store Credit</strong> – In certain situations, and only with
            your consent, we may offer store credit or an exchange instead of a monetary refund.
          </li>
        </ul>

        <p>
          If you have not received your refund within a reasonable period after receiving confirmation
          from us, please contact your bank or payment provider first, as processing times may vary.
          If the issue persists, you may contact our support team for assistance.
        </p>
      </PolicySection>

      <PolicySection number={6} title="Partial Refunds">
        <p>
          In certain situations, we may issue a partial refund:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            If the returned Product is missing accessories or original packaging, a restocking fee of
            up to 15% may be deducted.
          </li>
          <li>
            If only part of a bundled or combo order is returned, the refund will be proportional to
            the value of the returned item(s).
          </li>
          <li>
            Products returned in used or opened condition that are not defective may attract a
            restocking fee at our discretion.
          </li>
        </ul>
      </PolicySection>

      <PolicySection number={7} title="Refund Timeline">
        <p>The following timelines apply to the refund process:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Return request review: within 2 business days of submission.</li>
          <li>Reverse pickup: within 3 to 5 business days of approval.</li>
          <li>Inspection of returned Product: within 3 to 5 business days of receipt.</li>
          <li>Refund initiation: within 2 business days of inspection approval.</li>
          <li>Refund reflection in your account: 5 to 7 business days from initiation.</li>
        </ul>
      </PolicySection>

      <PolicySection number={8} title="Order Cancellation Refunds">
        <p>
          If you cancel an order before it has been dispatched, a full refund (including any shipping
          charges) will be processed within 5 to 7 business days. For orders cancelled after dispatch
          but before delivery, the refund will be processed after the Product is returned to our
          warehouse and inspected, with shipping charges non-refundable.
        </p>
      </PolicySection>

      <PolicySection number={9} title="Grievance Redressal">
        <p>
          At MICCROTEN, we are committed to resolving customer concerns in a fair and timely manner. If
          you are not satisfied with the resolution provided by our customer support team, you may
          escalate your concern by contacting us using the details below.
        </p>

        <ul className="list-none pl-0 space-y-3">
          <li>
            <strong className="text-gray-900">
              Grievance Officer
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
            We will review your grievance and make reasonable efforts to respond as soon as practicable.
          </li>
        </ul>
      </PolicySection>

      <PolicySection number={10} title="Changes to This Refund Policy">
        <p>
          MICCROTEN Technologies Pvt. Ltd. may update or modify this Refund Policy from time to time to
          reflect changes in our business practices, products, services, or applicable legal
          requirements.
        </p>

        <p>
          Any updates will be published on this page with a revised
          <strong> Effective Date</strong>. Orders placed before the revised policy becomes effective
          will continue to be governed by the Refund Policy that was in effect at the time of purchase.
        </p>
      </PolicySection>

      <PolicySection number={11} title="Contact Us">
        <p>
          If you have any questions regarding returns, replacements, cancellations, or refunds, please
          contact us using the details below.
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
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700"
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
