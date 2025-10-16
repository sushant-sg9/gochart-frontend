import React from "react";
import QuotexPage from "../QuotexPage";

const QuotexETCUSDPage: React.FC = () => {
  return (
    <QuotexPage 
      asset="ETCUSD_otc" 
      title="Ethereum Classic OTC"
      description="Real-time Quotex crypto data"
    />
  );
};

export default QuotexETCUSDPage;
