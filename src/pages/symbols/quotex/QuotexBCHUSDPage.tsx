import React from "react";
import QuotexPage from "../QuotexPage";

const QuotexBCHUSDPage: React.FC = () => {
  return (
    <QuotexPage 
      asset="BCHUSD_otc" 
      title="Bitcoin Cash OTC"
      description="Real-time Quotex crypto data"
    />
  );
};

export default QuotexBCHUSDPage;
