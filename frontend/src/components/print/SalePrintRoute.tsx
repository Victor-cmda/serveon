import { useParams } from 'react-router-dom';
import SalePrintView from './SalePrintView';

const SalePrintRoute = () => {
  const { id } = useParams<{ id: string }>();
  const saleId = parseInt(id || '0', 10);

  return <SalePrintView saleId={saleId} />;
};

export default SalePrintRoute;
