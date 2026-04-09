import React from 'react';
import {Provider as JotaiProvider} from 'jotai';

interface RecoilProviderProps {
  children: React.ReactNode;
}

const RecoilProvider: React.FC<RecoilProviderProps> = ({children}) => {
  return <JotaiProvider>{children}</JotaiProvider>;
};

export default RecoilProvider;
