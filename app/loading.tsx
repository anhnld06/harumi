import { RouteLoading } from '@/components/route-loading';

/** Fallback when navigating between top-level routes (e.g. home ↔ auth). */
export default function RootLoading() {
  return <RouteLoading variant="fullscreen" />;
}
