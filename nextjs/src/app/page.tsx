/**
 * @file This file contains the Home component, which serves as the main entry point for the application.
 * @module Home
 */
import ECommerce from "@/components/Dashboard/E-commerce";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { ToastContainer } from "react-toastify";

/**
 * Metadata for the Home page.
 * @typedef {Object} Metadata
 * @property {string} title - The title of the page.
 * @property {string} description - The description of the page.
 */
export const metadata: Metadata = {
  title: "Tail",
  description: "",
};

/**
 * The Home functional component.
 * This component represents the main entry point of the application.
 *
 * @component
 * @return {JSX.Element} The rendered Home component.
 */
export default function Home() {
  // Render the necessary components for the Home page.
  // The ToastContainer is used to display toast notifications.
  // The DefaultLayout component serves as the main layout for the application.
  // The ECommerce component represents the dashboard for the E-commerce application.
  return (
    <>
      {/* Render the ToastContainer component */}
      <ToastContainer />

      {/* Render the DefaultLayout component */}
      <DefaultLayout>

        {/* Render the ECommerce component */}
        <ECommerce />
      </DefaultLayout>
    </>
  );
}
