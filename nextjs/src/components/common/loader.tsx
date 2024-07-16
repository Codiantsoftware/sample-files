/**
 * @file This file contains the Loader component, which represents a spinning loader.
 * @module Loader
 */
import React from "react";

/**
 * The Loader functional component.
 * @component
 * @return {JSX.Element} The rendered Loader component.
 */
const Loader = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-white dark:bg-black">
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
    </div>
  );
};

export default Loader;
