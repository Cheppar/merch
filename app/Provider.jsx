import React from "react";
import Header from "./_components/home/Header";


function Provider({ children }) {
  return (
    <div>
      <Header />

      <div className="mt-1">{children}</div>
    </div>
  );
}

export default Provider;
