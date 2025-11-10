import { useState } from 'react';

interface UsePrintOptions {
  onBeforePrint?: () => void;
  onAfterPrint?: () => void;
}

export const usePrint = (options?: UsePrintOptions) => {
  const [isPrinting, setIsPrinting] = useState(false);

  const openPrintView = (componentPath: string, id: number) => {
    if (options?.onBeforePrint) {
      options.onBeforePrint();
    }

    setIsPrinting(true);

    // Mapeia o tipo para o path correto
    const pathMap: Record<string, string> = {
      sale: '/sales/print',
      purchase: '/purchases/print',
      accountPayable: '/accounts-payable/print',
    };

    const basePath = pathMap[componentPath] || '/print';
    const printUrl = `${basePath}/${id}`;

    // Abre em nova janela/aba
    const printWindow = window.open(printUrl, '_blank');

    // Aguarda a janela fechar
    const checkWindow = setInterval(() => {
      if (printWindow?.closed) {
        clearInterval(checkWindow);
        setIsPrinting(false);
        if (options?.onAfterPrint) {
          options.onAfterPrint();
        }
      }
    }, 500);
  };

  const printCurrent = () => {
    if (options?.onBeforePrint) {
      options.onBeforePrint();
    }

    setIsPrinting(true);
    window.print();

    // Aguarda o evento afterprint
    const handleAfterPrint = () => {
      setIsPrinting(false);
      if (options?.onAfterPrint) {
        options.onAfterPrint();
      }
      window.removeEventListener('afterprint', handleAfterPrint);
    };

    window.addEventListener('afterprint', handleAfterPrint);
  };

  return {
    isPrinting,
    openPrintView,
    printCurrent,
  };
};
