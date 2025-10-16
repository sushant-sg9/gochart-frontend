import React from "react";
import QuotexPage from "../QuotexPage";

const QuotexUSDCADPage: React.FC = () => {
  return (
    <QuotexPage 
      asset="USDCAD_otc" 
      title="USD/CAD OTC"
      description="Real-time Quotex data"
    />
  );
};

export default QuotexUSDCADPage;
