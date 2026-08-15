import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../Admin/lib/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        navigate("/shop");
      } else {
        navigate("/login");
      }
    };

    checkSession();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      Verifying your email...
    </div>
  );
}