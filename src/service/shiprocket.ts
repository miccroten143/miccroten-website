const SHIPROCKET_EMAIL = import.meta.env.VITE_SHIPROCKET_EMAIL;
const SHIPROCKET_PASSWORD = import.meta.env.VITE_SHIPROCKET_PASSWORD;

let token: string | null = null;

export async function getShiprocketToken() {
  if (token) return token;

  const res = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: SHIPROCKET_EMAIL,
      password: SHIPROCKET_PASSWORD,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Shiprocket Login Failed");
  }

  token = data.token;

  return token;
}