// Importing necessary modules and components
import React, { useState } from "react";
import { Col, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import userRoutesMap from "routeControl/userRouteMap";
import { logger, modalNotification, setLocalStorageToken } from "utils";
import { UserSignUpForm } from "components/Form";
import { selectUserData, updateUserData } from "redux/AuthSlice/index.slice";
import { UserAuthServices } from "services";
import { DEVICE_ID, DEVICE_TYPE, DEFAULT_COUNTRY_CODE  } from "config";

/**
 * Signup component handles user registration
 * @returns Signup component jsx
 */
function Signup() {
  const dispatch = useDispatch();
  const userData = useSelector(selectUserData);
  const navigate = useNavigate();
  const [loader, setLoader] = useState(false);

  // Function to handle user registration on form submission
  const handleSignUP = async (value) => {
    try {
      setLoader(true);
      // Capitalize the first letter of first and last name
      const newUserData = {
        ...value,
        firstName: value?.firstName?.replace(/\b\w/g, (match) =>
          match.toUpperCase(),
        ),
        lastName: value?.lastName?.replace(/\b\w/g, (match) =>
          match.toUpperCase(),
        ),
      };
      // Prepare data for API request
      let bodyData = {
        userId: userData?.userId,
        email: userData?.email,
        deviceId: DEVICE_ID,
        deviceType: DEVICE_TYPE,
        countryCode: DEFAULT_COUNTRY_CODE,
        ...newUserData,
      };
      // Remove unnecessary property if present
      if (bodyData.termAndCondtion) delete bodyData.termAndCondtion;

      // Call the user signup API
      const response = await UserAuthServices.userSignUp(bodyData);
      // Handle the API response
      if (response?.success) {
         // Show success notification
        modalNotification({
          type: "success",
          message: response?.message,
        });

        // Set user token in local storage
        setLocalStorageToken(response?.data?.token);

        // Update user data in Redux store
        dispatch(updateUserData(response?.data));

        // Navigate to user profile page
        navigate(userRoutesMap.PROFILE.path, "_self");
      }
      setLoader(false);
    } catch (error) {
      setLoader(false);
      // Log any errors that occur during the process
      logger(error);
    }
  };

  // Render the Signup component
  return (
    <>
      <section className="authPage">
        <Row className="g-0 h-100 justify-content-center">
          <Col className="authPage_form h-100">
            <div className="d-flex h-100 justify-content-start align-items-center flex-column authPage_form_form">
              <UserSignUpForm onSubmit={handleSignUP} loading={loader} />
            </div>
          </Col>
        </Row>
      </section>
    </>
  );
}

// Export the Signup component as the default export of this module
export default Signup;
