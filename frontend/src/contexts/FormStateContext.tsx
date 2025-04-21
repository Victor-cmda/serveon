import { createContext, useState, useContext, ReactNode } from 'react';

interface FormStateContextType {
  formStates: Record<string, any>;
  saveFormState: (formId: string, state: any) => void;
  getFormState: (formId: string) => any;
  clearFormState: (formId: string) => void;
  clearAllFormStates: () => void;
}

const FormStateContext = createContext<FormStateContextType | undefined>(
  undefined,
);

export function FormStateProvider({ children }: { children: ReactNode }) {
  const [formStates, setFormStates] = useState<Record<string, any>>({});

  const saveFormState = (formId: string, state: any) => {
    setFormStates((prev) => ({
      ...prev,
      [formId]: state,
    }));
  };

  const getFormState = (formId: string) => {
    return formStates[formId];
  };

  const clearFormState = (formId: string) => {
    setFormStates((prev) => {
      const newState = { ...prev };
      delete newState[formId];
      return newState;
    });
  };

  const clearAllFormStates = () => {
    setFormStates({});
  };

  return (
    <FormStateContext.Provider
      value={{
        formStates,
        saveFormState,
        getFormState,
        clearFormState,
        clearAllFormStates,
      }}
    >
      {children}
    </FormStateContext.Provider>
  );
}

export function useFormState() {
  const context = useContext(FormStateContext);
  if (context === undefined) {
    throw new Error('useFormState must be used within a FormStateProvider');
  }
  return context;
}
