/**
 * @fileOverview This file contains the SignUp component, which includes a signup form and layout.
 * @module SignUp
 */
"use client";
import React from "react";
import SignupForm from "@/components/Form/User/SignupForm";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { ToastContainer, toast } from "react-toastify";
import { userAuth } from "@/services/User";
import { auth } from "@/redux/features/AuthSlice/authSlice";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
/**
 * The SignUp functional component.
 * @component
 * @return {JSX.Element} The rendered SignUp component.
 */
const SignUp: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  /**
   * Handles the form submission for user signup.
   * @param {Object} value - User input values for signup.
   * @param {string} value.name - User's name.
   * @param {string} value.email - User's email.
   * @param {string} value.password - User's password.
   * @param {string} value.confirmPassword - User's password confirmation.
   * @returns {void}
   */
  const onSubmit = async (value: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    try {
      // Prepare the user signup data
      const obj = {
        email: value.email,
        password: value.password,
      };
      const { confirmPassword, ...formData } = value;

      // Sign up the user
      const res = await userAuth.userSignup(formData);
      const { status, message } = res;
      const resData = message;

      // If signup is successful, sign in the user
      if (status) {
        const res = await userAuth.userSignIn(obj);
        const { status, data, token, message } = res;
        const { name, email, id } = data;

        if (status && token) {
          // Store the user token in local storage
          localStorage.setItem("token", token);

          // Update the user authentication state
          await dispatch(
            auth({
              userId: id,
              name,
              email,
              token,
              userName: "",
              phoneNumber: "",
            })
          );

          // Show success message and redirect to profile page
          await toast.success(resData);
          router.push("/profile");
        } else {
          // Show error message if sign in fails
          toast.error(message);
        }
      } else {
        // Show error message if sign up fails
        toast.error(message);
      }
    } catch (error) {
      // Show error message if an exception occurs
      toast.error("Please try again!");
    }
  };

  return (
    <>
      <ToastContainer />
      <DefaultLayout>
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex flex-wrap items-center">
            <div className="hidden w-full xl:block xl:w-1/2">
              <div className="px-26 py-17.5 text-center">
                <p className="2xl:px-20">
                  Register to Tail and enjoy our Services
                </p>
              </div>
            </div>

            <div className="w-full border-stroke dark:border-strokedark xl:w-1/2 xl:border-l-2">
              <div className="w-full p-4 sm:p-12.5 xl:p-17.5">
                <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
                  Sign Up to Tail
                </h2>
                <SignupForm onSubmit={onSubmit} />
              </div>
            </div>
          </div>
        </div>
      </DefaultLayout>
    </>
  );
};

export default SignUp;
