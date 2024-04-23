/* 
  useContext로 상태관리하기 위한 파일 (강의에서 여러가지 방식을 보여주기 위함)
*/
'use client';

import { createContext, ReactNode, useState } from 'react';

export const TabContext = createContext({
  tab: 'rec',
  setTab: (value: 'rec' | 'fol') => {},
});

type Props = { children: ReactNode };
export default function TabProvider({ children }: Props) {
  const [tab, setTab] = useState('rec');

  return (
    <TabContext.Provider value={{ tab, setTab }}>
      {children}
    </TabContext.Provider>
  );
}
