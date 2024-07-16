import * as yup from "yup";

/**
 * Validation schema for user signup.
 * @returns {yup.ObjectSchema} Yup object schema for form validation.
 */
export default function validation() {
  return yup.object().shape({
    name: yup
      .string()
      .required("Name is required")
      .min(3, "Minimum 3 Character required"),
    email: yup.string().required("Email is required").email("Invalid email"),
    password: yup
      .string()
      .min(6, "Password must be minimum 6 digit")
      .max(15, "Password must be maximum 15 digit")
      .required("Password is required"),
    confirmPassword: yup
      .string()
      .required("Confirm Password is required")
      .oneOf(
        [yup.ref("password")],
        "Password and Confirm Password must be same",
      ),
  });
}
