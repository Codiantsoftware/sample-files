import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Col, Row } from "react-bootstrap";

import { UserLoginForm, UserVerificationForm } from "components/Form";

import { logger, modalNotification, setLocalStorageToken } from "utils";
import { login } from "redux/AuthSlice/index.slice";
import { UserAuthServices } from "services";
import { USER_LOGIN_STEPS, OTP_LENGTH, INITIAL_COUNTER } from "constant";
import { DEVICE_ID, DEVICE_TYPE } from "config";
import userRoutesMap from "routeControl/userRouteMap";

/**
 * Function use to user login component
 * @returns Login component jsx
 */
function Login() {
  const [step, setStep] = useState(USER_LOGIN_STEPS.FIRST);
  const [counter, setCounter] = useState(INITIAL_COUNTER);
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOTPLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Handle user login form submission
  const handleLoginSubmit = async ({ email }) => {
    setLoading(true);
    try {
      // Make API request for user login
      const response = await UserAuthServices.userLogin({ email });

      if (response?.success) {
        modalNotification({
          type: "success",
          message: response?.message,
        });
        setEmail(email);
        setStep(USER_LOGIN_STEPS.SECOND);
      }
    } catch (error) {
      logger(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle user verification form submission
  const handleVerificationSubmit = async () => {
    setOTPLoading(true);
    try {
      // Concatenate OTP digits
      const otpValue = Object.values(otp).join("");

      if (otpValue.length === OTP_LENGTH) {
        // Make API request for user verification
        const response = await UserAuthServices.userVerify({
          email,
          otp: parseInt(otpValue),
          deviceId: DEVICE_ID,
          deviceType: DEVICE_TYPE,
        });

        if (response?.success) {
          modalNotification({
            type: "success",
            message: response?.message,
          });

          const { token, isEmailVerified } = response?.data;

          dispatch(login(response?.data));

          // Navigate based on verification status
          if (token && isEmailVerified) {
            setLocalStorageToken(token);
            navigate(userRoutesMap.PROFILE.path);
          } else {
            navigate(userRoutesMap.SIGNUP.path);
          }
        }
      } else {
        modalNotification({
          type: "error",
          message: "Please enter a valid verification code",
        });
      }
    } catch (error) {
      logger(error);
    } finally {
      setOTPLoading(false);
    }
  };

  // Handle OTP resend
  const reSendOtp = async () => {
    try {
      // Make API request to resend OTP
      const response = await UserAuthServices.userLogin({ email });

      if (response?.success) {
        modalNotification({
          type: "success",
          message: response?.message,
        });

        setCounter(INITIAL_COUNTER);
      } else {
        modalNotification({
          type: "error",
          message: response?.message,
        });
      }
    } catch (error) {
      logger(error);
    }
  };

  // Timer logic for OTP resend
  useEffect(() => {
    let timer;
    if (counter > 0 && step === USER_LOGIN_STEPS.SECOND) {
      timer = setTimeout(() => setCounter((c) => c - 1), 1000);
    }

    return () => timer && clearTimeout(timer);
  }, [counter, step]);

  // Render the Login component
  return (
    <section className="authPage">
      <Row className="g-0 h-100 justify-content-center">
        <Col className="authPage_form h-100">
          <div className="d-flex h-100 justify-content-start align-items-center flex-column authPage_form_form">
            <div className="authPage_form_logo" />

            {step === USER_LOGIN_STEPS.FIRST && (
              // Render UserLoginForm for step 1
              <UserLoginForm onSubmit={handleLoginSubmit} loading={loading} />
            )}
            {step === USER_LOGIN_STEPS.SECOND && (
              // Render UserVerificationForm for step 2
              <UserVerificationForm
                onSubmit={handleVerificationSubmit}
                setOtp={setOtp}
                otp={otp}
                reSendOtp={reSendOtp}
                setCounter={setCounter}
                counter={counter}
                setStep={setStep}
                email={email}
                loading={otpLoading}
              />
            )}
          </div>
        </Col>
      </Row>
    </section>
  );
}

export default Login;
