import React from "react";
import QuotexPage from "../QuotexPage";

const QuotexEURUSDPage: React.FC = () => {
  return (
    <QuotexPage 
      asset="EURUSD_otc" 
      title="EUR/USD OTC"
      description="Real-time Quotex data"
    />
  );
};

export default QuotexEURUSDPage;
