import React, { createContext, useContext, useState } from "react";

interface ChartIndicator {
  blockPressure: boolean;
  volumeDelta: boolean;
  zigZag: boolean;
  pivotpoint: boolean;
  pricePercentageShadedCandel: boolean;
  renkoSRvolume: boolean;
}

interface ChartContextType {
  chartIndicator: ChartIndicator;
  setChartIndicator: React.Dispatch<React.SetStateAction<ChartIndicator>>;
}

interface TimeFrameContextType {
  timeFrame: string;
  updateTimeFrame: (newTimeFrame: string) => void;
  getTimeFrameLabel: (tf: string) => string;
}

const ChartContext = createContext<ChartContextType | undefined>(undefined);
const TimeFrameContext = createContext<TimeFrameContextType | undefined>(undefined);

export const ChartContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chartIndicator, setChartIndicator] = useState<ChartIndicator>({
    blockPressure: false,
    volumeDelta: false,
    zigZag: false,
    pivotpoint: false,
    pricePercentageShadedCandel: false,
    renkoSRvolume: false
  });

  const value: ChartContextType = {
    chartIndicator,
    setChartIndicator,
  };

  return <ChartContext.Provider value={value}>{children}</ChartContext.Provider>;
};

export const TimeFrameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [timeFrame, setTimeFrame] = useState('1');
  
  const updateTimeFrame = (newTimeFrame: string) => {
    setTimeFrame(newTimeFrame);
  };

  const getTimeFrameLabel = (tf: string) => {
    const labels: { [key: string]: string } = {
      '1': '1m',
      '3': '3m',
      '5': '5m',
      '15': '15m',
      '30': '30m',
      '60': '1h',
      '120': '2h',
      '240': '4h',
      '1D': '1D',
      '1W': '1W',
      '1M': '1M'
    };
    return labels[tf] || labels[timeFrame] || '1m';
  };

  const value: TimeFrameContextType = {
    timeFrame,
    updateTimeFrame,
    getTimeFrameLabel
  };

  return (
    <TimeFrameContext.Provider value={value}>
      {children}
    </TimeFrameContext.Provider>
  );
};

export const useChartStateContext = (): ChartContextType => {
  const context = useContext(ChartContext);
  if (!context) {
    throw new Error("useChartStateContext must be used within ChartContextProvider");
  }
  return context;
};

export const useTimeFrameContext = (): TimeFrameContextType => {
  const context = useContext(TimeFrameContext);
  if (!context) {
    throw new Error('useTimeFrameContext must be used within a TimeFrameProvider');
  }
  return context;
};
