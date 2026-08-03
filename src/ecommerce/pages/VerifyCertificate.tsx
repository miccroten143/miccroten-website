import { useState } from "react";
import { getCertificate } from "../../service/certificateService";
import type { Certificate } from "../../ecommerce/types";

export default function VerifyCertificate() {
  const [certificateNo, setCertificateNo] = useState("");
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleVerify = async () => {
    if (!certificateNo.trim()) return;

    setLoading(true);
    setNotFound(false);
    setCertificate(null);

    const result = await getCertificate(certificateNo);

    setLoading(false);

    if (result) {
      setCertificate(result);
    } else {
      setNotFound(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl p-8">

        <h1 className="text-3xl font-bold text-center">
          Certificate Verification
        </h1>

        <p className="text-gray-500 text-center mt-2">
          Verify Internship Certificates issued by
          MICCROTEN Technologies Pvt. Ltd.
        </p>

        <input
          className="w-full mt-8 border rounded-lg px-4 py-3"
          placeholder="Enter Certificate ID"
          value={certificateNo}
          onChange={(e) => setCertificateNo(e.target.value)}
        />

        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full mt-4 bg-blue-700 text-white py-3 rounded-lg hover:bg-blue-800 disabled:opacity-50"
        >
          {loading ? "Checking Certificate..." : "Verify Certificate"}
        </button>

        {certificate && (
          <div className="mt-8 border rounded-xl p-5 bg-green-50">

            <h2 className="text-green-700 text-xl font-bold">
              ✔ VERIFIED
            </h2>

            <div className="mt-4 space-y-2">

              <p>
                <strong>Name:</strong> {certificate.intern_name}
              </p>

              <p>
                <strong>Role:</strong> {certificate.role}
              </p>

              <p>
                <strong>Department:</strong> {certificate.department}
              </p>

              <p>
                <strong>College:</strong> {certificate.college}
              </p>

              <p>
                <strong>Certificate No:</strong>{" "}
                {certificate.certificate_no}
              </p>

            </div>
          </div>
        )}

        {notFound && (
          <div className="mt-8 border rounded-xl p-5 bg-red-50">

            <h2 className="text-red-600 font-bold text-xl">
              Certificate Not Found
            </h2>

            <p className="mt-2 text-gray-600">
              The entered Certificate ID was not found.
            </p>

          </div>
        )}

      </div>
    </div>
  );
}