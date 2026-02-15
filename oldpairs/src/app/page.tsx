import ErrorBoundary from '@/components/ErrorBoundary';
import Screener from '@/components/Screener';

export default function Home() {
  return (
    <ErrorBoundary>
      <Screener />
    </ErrorBoundary>
  );
}
