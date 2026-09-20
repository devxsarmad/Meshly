import { toast } from 'sonner';

export type ToastKind = 'success' | 'error' | 'warning' | 'info';

export function notify(kind: ToastKind, message: string) {
  toast[kind](message);
}
