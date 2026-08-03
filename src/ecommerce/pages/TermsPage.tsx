import { PolicyLayout, PolicySection } from '../components/PolicyLayout';

export default function TermsPage() {
  return (
    <PolicyLayout
      title="Terms &amp; Conditions"
      subtitle="The terms governing your use of MICCROTEN Technologies' website and services."
      effectiveDate="1 August 2026"
    >
      <PolicySection number={1} title="Introduction">
        <p>
          Welcome to <strong>MICCROTEN Technologies Pvt. Ltd.</strong> ("MICCROTEN", "we", "us", or
          "our"). These Terms &amp; Conditions ("Terms") govern your access to and use of our website,
          <strong> www.miccroten.com</strong> (the "Website"), as well as the purchase and use of our
          products and services.
        </p>

        <p>
          By accessing, browsing, creating an account, or placing an order through our Website, you
          acknowledge that you have read, understood, and agreed to comply with these Terms. If you do
          not agree with any part of these Terms, you should not access or use our Website, products, or
          services.
        </p>

        <p>
          These Terms apply to all visitors, customers, registered users, and anyone who accesses or uses
          the Website. We encourage you to read these Terms carefully before using our Website or making a
          purchase.
        </p>
      </PolicySection>

      <PolicySection number={2} title="Definitions">
        <ul className="list-disc pl-6 space-y-3">
          <li>
            <strong className="text-gray-900">Products</strong> refer to all products offered through our
            Website, including MICCROTEN-developed products such as RFID devices, biomedical devices, IoT
            solutions, robotics products, embedded systems, electronic applications, development boards,
            software, and other technology solutions, as well as third-party products including Arduino,
            Raspberry Pi, ESP development boards, sensors, modules, electronic components, accessories,
            and related hardware.
          </li>

          <li>
            <strong className="text-gray-900">Website</strong> refers to
            <strong> www.miccroten.com</strong> and all associated web pages, services, and online
            platforms operated by MICCROTEN Technologies Pvt. Ltd.
          </li>

          <li>
            <strong className="text-gray-900">User</strong>, <strong className="text-gray-900">"you"</strong>,
            and <strong className="text-gray-900">"your"</strong> refer to any individual or entity that
            accesses, browses, registers, or uses our Website or services.
          </li>

          <li>
            <strong className="text-gray-900">Order</strong> means a request placed by a customer to
            purchase one or more Products through our Website.
          </li>

          <li>
            <strong className="text-gray-900">Services</strong> include product sales, technical support,
            custom hardware and software development, research &amp; development services, product
            customization, and any other services offered by MICCROTEN.
          </li>

          <li>
            <strong className="text-gray-900">GST</strong> refers to the Goods and Services Tax and any
            other applicable taxes imposed under the laws of India.
          </li>
        </ul>
      </PolicySection>

      <PolicySection number={3} title="Use of the Website">
        <p>
          You may access and use our Website only for lawful purposes and in accordance with these Terms.
          By using our Website, you agree to act responsibly and not engage in any activity that may harm
          MICCROTEN, our customers, or the operation of our Website.
        </p>

        <p>You agree that you will <strong>not</strong>:</p>

        <ul className="list-disc pl-6 space-y-3">
          <li>
            Use the Website for any unlawful, fraudulent, or unauthorized purpose.
          </li>

          <li>
            Attempt to gain unauthorized access to our Website, servers, databases, user accounts, or
            connected systems.
          </li>

          <li>
            Copy, reproduce, modify, distribute, scrape, reverse engineer, or exploit any part of the
            Website or its content without our prior written permission.
          </li>

          <li>
            Upload or transmit viruses, malware, malicious code, or any content that may damage or
            interfere with the security or functionality of the Website.
          </li>

          <li>
            Interfere with or disrupt the operation, security, or performance of the Website or the
            experience of other users.
          </li>

          <li>
            Provide false, misleading, or inaccurate information while creating an account or placing an
            order.
          </li>

          <li>
            Place fraudulent, fake, or unauthorized orders, or misuse our promotional offers, discounts,
            or coupons.
          </li>

          <li>
            Use our Website or products in violation of any applicable laws or regulations.
          </li>
        </ul>

        <p>
          We reserve the right to suspend or terminate access to our Website, cancel orders, or take
          appropriate legal action if we believe these Terms have been violated.
        </p>
      </PolicySection>

      <PolicySection number={4} title="Account Registration">
        <p>
          To place an order or access certain features, you may need to create an account. You agree
          to provide accurate, current, and complete information during registration and to keep your
          account details updated.
        </p>
        <p>
          You are responsible for safeguarding your password and for all activities that occur under
          your account. You agree to notify us immediately of any unauthorised use of your account.
          MICCROTEN shall not be liable for any loss arising from unauthorised account access.
        </p>
      </PolicySection>

      <PolicySection number={5} title="Products & Pricing">
        <p>
          MICCROTEN offers a wide range of products, including our own research and development (R&D)
          products such as RFID devices, biomedical devices, IoT solutions, robotics products, embedded
          systems, electronic applications, and development boards, as well as third-party electronic
          products including Arduino, Raspberry Pi, ESP development boards, sensors, modules,
          accessories, and related components.
        </p>

        <p>
          All products displayed on our Website are subject to availability. We reserve the right to
          modify, discontinue, limit quantities, or refuse orders for any product without prior notice.
          Product images, colors, specifications, and packaging are provided for reference and may vary
          slightly from the actual product.
        </p>

        <p>
          All prices are displayed in Indian Rupees (INR) and include applicable GST unless stated
          otherwise. Prices, product specifications, and promotional offers may change without prior
          notice. The price shown at the time your order is confirmed will be the final price charged.
        </p>

        <p>
          Many of our products are intended for technical, educational, research, industrial, or
          development purposes. Customers are responsible for reviewing product descriptions,
          specifications, compatibility, and intended applications before making a purchase. MICCROTEN is
          not responsible for issues resulting from incorrect product selection or improper use.
        </p>
      </PolicySection>

      <PolicySection number={6} title="Orders & Order Acceptance">
        <p>
          Placing an order on our Website constitutes an offer to purchase the selected products. Orders
          are subject to verification, payment confirmation, and product availability.
        </p>

        <p>
          Your order will be considered accepted only after we send an Order Confirmation via email,
          SMS, or other available communication channels. Until then, MICCROTEN reserves the right to
          accept, reject, or cancel any order.
        </p>

        <ul className="list-disc pl-6 space-y-3">
          <li>Products are unavailable or out of stock.</li>
          <li>Incorrect pricing or product information is displayed.</li>
          <li>Payment authorization or verification fails.</li>
          <li>We suspect fraudulent, unauthorized, or illegal activity.</li>
          <li>The order cannot be fulfilled due to operational or technical reasons.</li>
        </ul>

        <p>
          If an order is cancelled after payment has been received, the eligible amount will be refunded
          in accordance with our Refund Policy.
        </p>
      </PolicySection>

      <PolicySection number={7} title="Payment">
        <p>
          We accept payments through approved payment gateways including UPI, credit/debit cards,
          net banking, and popular digital wallets. All payments are processed securely, and we do
          not store your card details on our servers.
        </p>
        <p>
          Orders for which payment is not received within 24 hours of placement may be automatically
          cancelled. For bulk or institutional orders, we may accept payment via NEFT/RTGS against a
          proforma invoice, subject to prior arrangement.
        </p>
      </PolicySection>

      <PolicySection number={8} title="Shipping & Delivery">
        <p>
          We deliver products across India through trusted logistics and courier partners. Estimated
          delivery dates displayed on our Website are approximate and may vary depending on your delivery
          location, courier service availability, product availability, public holidays, or unforeseen
          circumstances.
        </p>

        <p>
          Shipping charges, if applicable, will be displayed during checkout before you complete your
          order. Once your order has been dispatched, you will receive tracking information whenever
          available.
        </p>

        <p>
          Customers are responsible for providing a complete and accurate shipping address, contact
          number, and PIN code. MICCROTEN shall not be responsible for delays or failed deliveries caused
          by incorrect or incomplete shipping information.
        </p>

        <p>
          If you receive a damaged, defective, incorrect, or incomplete product, please contact us within
          <strong> 48 hours </strong>
          of delivery with your order details and clear photographs so that we can investigate and
          provide an appropriate resolution in accordance with our Return & Refund Policy.
        </p>
      </PolicySection>

      <PolicySection number={9} title="Warranty">
        <p>
          Warranty coverage is provided only for eligible products that are designed, developed, and
          manufactured by <strong>MICCROTEN Technologies Pvt. Ltd.</strong> The applicable warranty
          period, coverage, and terms will be specified on the respective product page or included with
          the product documentation.
        </p>

        <p>
          Third-party products sold through our Website, including but not limited to Arduino, Raspberry
          Pi, ESP development boards, sensors, modules, electronic components, accessories, and similar
          products, are generally supplied <strong>without any warranty from MICCROTEN</strong>, unless
          explicitly stated otherwise on the product page. Any manufacturer's warranty, if available,
          shall be governed solely by the respective manufacturer’s terms and conditions.
        </p>

        <p>
          Warranty does not cover damage resulting from improper installation, misuse, accidents,
          unauthorized modifications, normal wear and tear, improper storage, liquid damage, electrical
          surges, incorrect power supply, or any use outside the intended operating conditions.
        </p>

        <p>
          To request warranty support for an eligible MICCROTEN product, please contact us with your
          order number, product details, and a description of the issue. After inspection and
          verification, we will determine whether the product qualifies for repair, replacement, or any
          other remedy under the applicable warranty terms.
        </p>
      </PolicySection>

      <PolicySection number={10} title="Intellectual Property">
        <p>
          All content on the Site, including text, graphics, logos, images, product designs, and
          software, is the property of MICCROTEN Technologies or its licensors and is protected by
          Indian and international intellectual property laws. You may not reproduce, distribute, or
          create derivative works from any content without our prior written consent.
        </p>
      </PolicySection>

      <PolicySection number={11} title="Limitation of Liability">
        <p>
          To the fullest extent permitted by law, MICCROTEN Technologies shall not be liable for any
          indirect, incidental, special, consequential, or punitive damages, including loss of
          profits, data, or business opportunities, arising out of or related to your use of the
          Site or Products.
        </p>
        <p>
          Our total liability for any claim arising from the purchase of Products shall not exceed
          the amount you paid for the relevant Product.
        </p>
      </PolicySection>

      <PolicySection number={12} title="Governing Law & Dispute Resolution">
        <p>
          These Terms &amp; Conditions shall be governed by and interpreted in accordance with the laws of
          the Republic of India.
        </p>

        <p>
          Any dispute, claim, or disagreement arising from the use of our Website, products, or services
          shall first be resolved through good-faith discussions between the parties.
        </p>

        <p>
          If the dispute cannot be resolved amicably, it shall be subject to the exclusive jurisdiction
          of the competent courts in <strong>Bengaluru, Karnataka, India</strong>.
        </p>
      </PolicySection>

      <PolicySection number={13} title="Changes to These Terms">
        <p>
          We may revise these Terms at any time. The most current version will be posted on this
          page with the updated &quot;Effective Date&quot;. Your continued use of the Site after
          changes are posted constitutes your acceptance of the revised Terms.
        </p>
      </PolicySection>

      <PolicySection number={14} title="Contact Us">
        <p>
          If you have any questions, concerns, or require clarification regarding these Terms &amp;
          Conditions, please contact us using the details below.
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
