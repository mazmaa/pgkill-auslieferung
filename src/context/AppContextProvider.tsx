import React, { createContext, useContext, useState } from "react";

export type PipelineComponentEnum = typeof PipelineComponents[keyof typeof PipelineComponents]
export const PipelineComponents = {
  INPUT: 'Input',
  ASR: 'Asr',
  LLM: 'Llm',
} as const;

interface AppContext {
  selectedComponent: PipelineComponentEnum,
  setSelectedComponent: React.Dispatch<React.SetStateAction<PipelineComponentEnum>>
}

const AppContext = createContext<null | AppContext>(null);


export const AppContextProvider = ({ children }: { children: React.ReactNode }) => {

  const [selectedComponent, setSelectedComponent] = useState<PipelineComponentEnum>(PipelineComponents.LLM);
  let context = {
    selectedComponent,
    setSelectedComponent,
  }

  return (
    <AppContext.Provider value={context}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppContextProvider");
  }
  return context;
};
