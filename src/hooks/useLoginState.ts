
import { useLoginHandlers } from './auth';

export const useLoginState = (noAutoRedirect: boolean = false) => {
  return useLoginHandlers(noAutoRedirect);
};
