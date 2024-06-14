# React-Query
  * 모듈, devtools 5버전 이상 설치

### React-Query
  - 핵심은 서버의 데이터를 가져오는 것 (Redux: 컴포넌트 간 데이터 공유)
  - 데이터 캐싱! -> 사용자가 매우 빠르게 컨텐츠 확인 가능 (트래픽 관리에 좋음)
  - 필요하다면 Zustand와 함께 사용 (Zustand: 가벼운 Redux 느낌)
  - React-Query(데이터 패칭) + Zustand/Recoil/Redux(컴포넌트 간 데이터 공유)
  - 인터페이스를 표준화했다. (데이터를 가져올 때 로딩, 성공, 실패 상태가 표준화 됨)
  - 키 시스템

### React-Query SSR 설정
  1. RQ Provider 컴포넌트 생성 (하위 컴포넌트에서는 모두 state 공유 가능)
  2. 서버로부터 Fetching한 데이터를 공유하고 싶은 컴포넌트에 RQ Provider로 감싸줌
  3. 데이터 fetching이 필요한 컴포넌트에서 `QueryClient` 인스턴스를 생성하고 `prefetchQuery`를 실행
  ```javascript
    const queryClient = new QueryClient();

    // queryKey를 가진 경우에 queryFn 함수를 실행해서 데이터를 받아와라!
    queryClient.prefetchQuery({ queryKey, queryFn })
  ```

  ```javascript
    async function queryFnName() {
      const res = await fetch('http://api.request.url', {
        // Next.js에서 옵션으로 tags를 지원
        next: { 
          // 캐싱 설정을 해뒀을 때, 새로운 데이터를 적절하게 업데이트 하기 위한 키
          tags: ['posts', 'recommends'], 
        },  
        // 데이터 fetching을 후 받아온 결과 데이터를 자동으로 저장.
        // 자동 저장을 원하지 않으면(캐싱을 하고 싶지 않을 때) 속성 추가
        cache: 'no-store',
      });

      /*
        // next-tags를 revalidateTag의 인자로 보내, 관련 캐시 초기화
        revalidateTag('recommends')

        // /home에 접속할 때, 관련 캐시 초기화
        revalidatePath('/home')
      */

      return res.json();
    }
  ```   
  1. 서버에서 불러온 데이터를 클라이언트의 React Query가 물려받는다 (Hydrate 한다)   
    1) 데이터를 불러오고 나면 dehydrate 해준다.   
    2) 위의 데이터를 RQ가 hydarate 한다. (서버에서 온 데이터를 클라이언트에서 형식 맞춰서 그대로 물려받는 것)   
      ```jsx
        // 4-1
        const dehydrateState = dehydrate(queryClient);

        ...

        <!-- 4-2 -->
        <HydrationBoundary state={dehydrateState}>
          ...
        </HydrationBoundary>
      ```   

### 메소드
  * `prefetchQuery`
    - SSR 위함 (SEO)
    - 사용자가 데이터를 필요로 하기 전에 미리 데이터를 fetching 해두는 것
  * `getQueryData/setQueryData`
    - 서버에서 불러온 데이터 가져오기/수정하기
  * `prefetchInfiniteQuery`: ??? / 무한 스크롤링 쉽게 구현 가능
  * `useQuery`: ??? / 기존에 가져온게 없을 경우 새로 불러옴. 조회.
  * `useMutation`: ??? / 생성, 수정, 삭제.
  * `getQueryData`: ??? / useQuery로 가져온게 있다면 그대로 가져다 쓰는 기능.

### 상태
  * `Fresh`   
    - 서버에서 불러온 최신 데이터를 의미. 
    - Stale로 바뀌게 되는 시간은 직접 설정해줘야 함 (staleTime)
    - 0일 경우 바로 Fresh -> Stale 변경됨
  * `Stale`   
    - 기회가 되면 데이터를 가져와라. 
    - 사용자의 의도!! (캐시를 얼마나 오래 간직할지 의도). 
    - [ 탭 전환(refetchOnWindowFocus), 컴포넌트 onMount(retryOnMount), 인터넷 연결됨(refetchOnReconnect), 조회 실패 시 재시도 횟수(retry) ] 설정 가능. 
  * `Inactive`   
    - 화면에서 키 관련 데이터를 사용하고 있는지 확인. 
    - gcTime이 시작됨(가비지콜렉션 타임 / 5분이 기본)
    - gcTime동안 사용되지 않아 메모리가 정리되면 데이터를 새로 불러와야 함. 
    - gcTime > staleTime.
  * `Fetching`   
    - 데이터를 가져오는 순간. 
    - 순간적인 상황이라 상태 변화를 확인하기 힘듦.
  * `Paused`   
    - 오프라인(인터넷 연결 없음) 등의 경우 데이터를 가져오는 것을 잠시 멈춘 상태. 

### Actions
  * `Refetch`   
    - 데이터 무조건 새로 가져옴. 
    - 화면에 필요하진 않지만 데이터가 필요할 경우에도 사용.
  * `Invalidate`   
    - Refetch 보다는 좀 더 효율적인 방식. 
    - Inactive일 경우에는 가져오지 않음. 
    - 현재 화면에서 데이터를 사용할 경우에만 가져옴.
  * `Reset`   
    - initialData가 있을 경우 해당 값으로 돌리고 싶을 경우 사용.
  * `Remove`   
    - 데이터 제거. 
    - 새로고침 시 다시 가져옴.
  * `Trigger Loading`   
    - 로딩 상태 확인.
  * `Trigger Error`   
    - 에러 상태 확인.


# Intersection Observer
  - 브라우저 최하단에 가상의 태그를 설치 후 스크롤을 내림에 따라 해당 태그가 노출되면, 이벤트를 발생시키는 것.
  - 무한 스크롤링에 사용 (scrollHeight 사용은 옛스러운 방식)
  - react-intersection-observer 라이브러리 사용!
  ```javascript
    import { useInVidew } from 'react-intersection-observer';

    ...

    const { ref, inView } = useInView({
      threshold: 0, // ref 설정된 박스가 언제쯤 보일 때 이벤트 발생시킬지
      delay: 0,     // 보인 후 몇 초 후 이벤트 발생시킬지
    });

    useEffect(() => {
      if (inView) { // 화면에 보일 경우
        ... // fetchNextPage() 와 같은 동작 수행
      }
    }, [inView]);

    ...

    <div ref={ref} style={{ height: 0 }} />
  ```

# 로딩/에러 파일 처리
  - `<Suspense>`는 children의 로딩이 끝나기 전까지 fallback을 보여줌.
  ```
    - 서버에서 데이터 가져오기
    - Lazy-Loading
    - use 사용 ( use(컨택스트/프로미스) )
  ```
  - 로딩
  ```jsx
    <Suspense fallback={<Loading />}>
      <Page />
    </Suspense>
  ```
  - 에러
  ```jsx
    <ErrorBoundary fallback={<Error />}>
      <Page />
    </Suspense>
  ```
  - 로딩 & 에러
  ```jsx
    <ErrorBoundary fallback={<Error />}>
      <Suspense fallback={<Loading />}>
        <Page />
      </Suspense>
    </Suspense>
  ```
  - page.tsx 자체의 로딩은 알아서 loading.tsx 파일로 뜸
  - 서버 컴포넌트에서의 로딩은 Suspense의 fallback에 직접 별도 로딩화면 넣어줘야 함
  - 클라이언트 컴포넌트에서의 로딩은 
    * `추천` useSuspenseQuery/useSuspenseInfiniteQuery를 사용해 상위 Suspense에 걸리도록 (isPending 미사용)
    * React-Query의 isPending, 별도 로딩화면 사용 (로딩화면이 중복 사용되는 단점)