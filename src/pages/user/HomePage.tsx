import React from "react";
import GoChartAnalysisWidget from "../../components/charts/TradingViewWidget";

const HomePage: React.FC = () => {
  return (
    <div className="h-screen w-full">
      <GoChartAnalysisWidget />
    </div>
  );
};

export default HomePage;