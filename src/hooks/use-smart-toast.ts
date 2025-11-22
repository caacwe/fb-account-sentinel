import { toast as sonnerToast } from "sonner";

/**
 * 智能 Toast Hook - 新消息出现时自动清除旧消息
 */
export const toast = {
  success: (message: string, data?: any) => {
    sonnerToast.dismiss();
    return sonnerToast.success(message, data);
  },
  error: (message: string, data?: any) => {
    sonnerToast.dismiss();
    return sonnerToast.error(message, data);
  },
  info: (message: string, data?: any) => {
    sonnerToast.dismiss();
    return sonnerToast.info(message, data);
  },
  warning: (message: string, data?: any) => {
    sonnerToast.dismiss();
    return sonnerToast.warning(message, data);
  },
  message: (message: string, data?: any) => {
    sonnerToast.dismiss();
    return sonnerToast(message, data);
  },
  dismiss: sonnerToast.dismiss,
  loading: sonnerToast.loading,
  promise: sonnerToast.promise,
};
