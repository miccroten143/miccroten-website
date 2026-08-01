import { PolicyLayout, PolicySection } from '../components/PolicyLayout';

export default function CancellationPolicyPage() {
  return (
    <PolicyLayout
      title="Cancellation Policy"
      subtitle="Understanding how and when orders can be cancelled on the MICCROTEN store."
      effectiveDate="1 August 2026"
    >
      <PolicySection number={1} title="Introduction">
        <p>
          At <strong>MICCROTEN Technologies Pvt. Ltd.</strong>, we understand that you may need to cancel
          an order occasionally. This Cancellation Policy explains when and how you can cancel an order
          placed through <strong>www.miccroten.com</strong>.
        </p>

        <p>
          By placing an order on our Website, you agree to the terms of this Cancellation Policy.
        </p>
      </PolicySection>

      <PolicySection number={2} title="Order Cancellation by Customer">
        <p>
          You may request to cancel your order before it has been packed or shipped from our warehouse.
          Once the order has been dispatched, it can no longer be cancelled.
        </p>

        <ul className="list-disc pl-6 space-y-3">
          <li>Orders cancelled before dispatch are generally eligible for a full refund.</li>
          <li>Once the order has been shipped, cancellation is not possible.</li>
          <li>
            If you no longer need the product after dispatch, please refer to our Return & Refund Policy
            to check whether your order is eligible for return.
          </li>
        </ul>
      </PolicySection>

      <PolicySection number={3} title="Order Cancellation by MICCROTEN">
        <p>
          In certain situations, MICCROTEN may cancel an order before shipment. If this happens, you will
          be informed, and any eligible payment received will be refunded.
        </p>

        <p>Orders may be cancelled for reasons including:</p>

        <ul className="list-disc pl-6 space-y-3">
          <li>Product is out of stock or unavailable.</li>
          <li>Incorrect pricing or product information.</li>
          <li>Payment failure or payment verification issues.</li>
          <li>Incorrect or incomplete delivery address.</li>
          <li>Suspected fraudulent or unauthorized transactions.</li>
          <li>Any operational, technical, or legal reasons beyond our control.</li>
        </ul>
      </PolicySection>

      <PolicySection number={4} title="Refund for Cancelled Orders">
        <p>
          If your cancellation request is approved before shipment, the refund will be processed to your
          original payment method whenever possible.
        </p>

        <p>
          Refund processing times may vary depending on your bank, payment gateway, or financial
          institution.
        </p>
      </PolicySection>

      <PolicySection number={5} title="Custom & Special Orders">
        <p>
          Orders for custom-built products, personalized items, PCB assemblies, programmed devices,
          embedded systems, IoT solutions, or products manufactured specifically for a customer generally
          cannot be cancelled once production or customization has begun.
        </p>
      </PolicySection>
      <PolicySection number={6} title="How to Request a Cancellation">
        <p>
          If you wish to cancel an order, please contact us as soon as possible with your order number and
          the reason for cancellation.
        </p>

        <ul className="list-none pl-0 space-y-3">
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
        </ul>
      </PolicySection>
      <PolicySection number={7} title="Changes to This Cancellation Policy">
        <p>
          MICCROTEN Technologies Pvt. Ltd. may update this Cancellation Policy from time to time to
          reflect changes in our business practices or legal requirements.
        </p>

        <p>
          Any updates will be published on this page with a revised <strong>Effective Date</strong>.
          Continued use of our Website after such changes constitutes your acceptance of the updated
          Cancellation Policy.
        </p>
      </PolicySection>
    </PolicyLayout>
  );
}
