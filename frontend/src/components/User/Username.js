import React, { useEffect, useState } from "react";
import { getMe } from "./../../services/auth.api";

const Username = () => {
  const [fullname, setFullname] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await getMe();
        console.log(res);
        
        setFullname(res?.fullname || "");
      } catch (err) {
        console.error("Failed to fetch user info:", err);
        setError("خطا در دریافت اطلاعات کاربر");
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  if (loading) return null; 
  if (error) return <span>{error}</span>;

  return <span className="nav-link">{fullname}</span>;
};

export default Username;
