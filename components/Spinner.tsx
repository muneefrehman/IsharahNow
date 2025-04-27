import React from "react";

const Spinner = () => {
  return (
    <div className="flex justify-center items-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-transparent border-white" />
    </div>
  );
};

export default Spinner;
