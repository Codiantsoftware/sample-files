/**
 * @file This file contains the RootLayout component, which serves as the root layout for the application.
 * @module RootLayout
 */
"use client";
// import "jsvectormap/dist/css/jsvectormap.css";
import "flatpickr/dist/flatpickr.min.css";
import "@/css/satoshi.css";
import "@/css/style.css";
import "react-toastify/dist/ReactToastify.css";
import React, { useEffect, useState } from "react";
import Loader from "@/components/common/Loader";
import ReduxProvider from "@/redux/provider";

/**
 * The RootLayout functional component.
 * This component serves as the root layout for the entire application and
 * is responsible for rendering the Redux store provider and the loading
 * indicator.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {React.ReactNode} props.children - The child components to be
 *   rendered within the layout.
 * @return {JSX.Element} The rendered RootLayout component.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): JSX.Element {
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * useEffect hook to simulate loading delay.
   * This hook is used to simulate a loading delay so that the loading
   * indicator is visible for a short period of time.
   *
   * @function
   * @memberof RootLayout
   * @inner
   */
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <div className="dark:bg-boxdark-2 dark:text-bodydark">
          {loading ? <Loader /> : <ReduxProvider>{children}</ReduxProvider>}
        </div>
      </body>
    </html>
  );
}
