import React from "react";
import QuotexPage from "../QuotexPage";

const QuotexUSDINRPage: React.FC = () => {
  return (
    <QuotexPage 
      asset="USDINR_otc" 
      title="USD/INR OTC"
      description="Real-time Quotex data"
    />
  );
};

export default QuotexUSDINRPage;
