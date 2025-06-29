import { createContext, useState, useContext, ReactNode } from 'react';

interface FormStateContextType {
  formStates: Record<string, unknown>;
  saveFormState: (formId: string, state: unknown) => void;
  getFormState: (formId: string) => unknown;
  clearFormState: (formId: string) => void;
  clearAllFormStates: () => void;
}

const FormStateContext = createContext<FormStateContextType | undefined>(
  undefined,
);

export function FormStateProvider({ children }: { children: ReactNode }) {
  const [formStates, setFormStates] = useState<Record<string, unknown>>({});

  const saveFormState = (formId: string, state: unknown) => {
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
