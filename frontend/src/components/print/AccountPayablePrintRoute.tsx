import { useParams } from 'react-router-dom';
import AccountPayablePrintView from './AccountPayablePrintView';

const AccountPayablePrintRoute = () => {
  const { id } = useParams<{ id: string }>();
  const accountId = parseInt(id || '0', 10);

  return <AccountPayablePrintView accountId={accountId} />;
};

export default AccountPayablePrintRoute;
