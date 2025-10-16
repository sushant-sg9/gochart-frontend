import React from "react";
import QuotexPage from "../QuotexPage";

const QuotexEURCADPage: React.FC = () => {
  return (
    <QuotexPage 
      asset="EURCAD_otc" 
      title="EUR/CAD OTC"
      description="Real-time Quotex data"
    />
  );
};

export default QuotexEURCADPage;
