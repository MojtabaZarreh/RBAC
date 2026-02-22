
import React, { createContext, useContext, useEffect, useState } from "react";
import { getCompanyProfile } from "../services/company.api";
import { useAuth } from "./AuthContext";

const BASE_URL = process.env.REACT_APP_MEDIA_URL;

const CompanyLogoContext = createContext(null);

export const CompanyLogoProvider = ({ children }) => {
  const { isAuthenticated, authLoading, user } = useAuth();
  
  const [logo, setLogo] = useState("");
  const [loading, setLoading] = useState(false);


  const isAuthLoading = authLoading === undefined ? false : authLoading;
  
  const isUserLoggedIn = isAuthenticated === undefined ? !!user : isAuthenticated;

  useEffect(() => {
    console.log("LogoContext Status:", { isAuthLoading, isUserLoggedIn, user });

    if (isAuthLoading) return;

    if (!isUserLoggedIn) {
      setLogo("");
      setLoading(false);
      return;
    }

    let abort = false;

    const loadLogo = async () => {
      console.log('Start loading logo...'); 
      
      setLoading(true);
      try {
        const res = await getCompanyProfile();
        
        if (abort) return;

        if (res?.logo) {
          const finalLogo = res.logo.startsWith("http")
            ? res.logo
            : `${BASE_URL}/${res.logo.replace(/^\//, "")}`;

          console.log("Logo loaded:", finalLogo);
          setLogo(finalLogo);
        }
      } catch (err) {
        if (!abort && err?.response?.status !== 401) {
          console.error("Logo fetch failed", err);
        }
      } finally {
        if (!abort) setLoading(false);
      }
    };

    loadLogo();

    return () => {
      abort = true;
    };
  }, [isUserLoggedIn, isAuthLoading, user]); 

  return (
    <CompanyLogoContext.Provider value={{ logo, setLogo, loading }}>
      {children}
    </CompanyLogoContext.Provider>
  );
};

export const useCompanyLogoContext = () => {
  const ctx = useContext(CompanyLogoContext);
  if (!ctx) {
    throw new Error("useCompanyLogo must be used inside CompanyLogoProvider");
  }
  return ctx;
};
