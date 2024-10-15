* 강의 버전 : github.com/zerocho/next-app-router-z<br/>
* 배포 버전 : github.com/zerocho/z-com ( z.nodebird.com )
<br><br>
* Page Routing + React-Query + Zustand
  * https://medium.com/@zerebkov.artjom/how-to-structure-next-js-project-with-zustand-and-react-query-c4949544b0fe

# React-Query

  * 모듈, devtools 5버전 이상 설치


### 1. React-Query

  * 사용 이유
    * 핵심은 서버의 데이터를 가져오는 것 (Redux: 컴포넌트 간 데이터 공유)
    * 데이터 캐싱! -> 사용자가 매우 빠르게 컨텐츠 확인 가능 (트래픽 관리에 좋음)
    * 인터페이스를 표준화했다. (데이터를 가져올 때 로딩, 성공, 실패 상태가 표준화 됨)
    * 키 시스템
  * 필요하다면 ***Zustand*** / ***Context API***와 함께 사용 (Zustand: Redux의 가벼운 버전)
    * React-Query(데이터 패칭) + Zustand/Recoil/Redux(컴포넌트 간 데이터 공유)


### 2. States

  * Fresh, Stale, Inactive 중심으로 확인.
  * `Fresh`   
    * 서버에서 불러온 최신 데이터를 의미. 
    * Stale로 바뀌게 되는 시간은 직접 설정해줘야 함 (staleTime)
      * 기본값은 0 (RQ는 기본적으로 모든 데이터가 fresh가 아니다! 라고 설정해둠)
        * 0일 경우 바로 Fresh -> Stale 변경됨
      * ***Infinity***: 항상 fresh (한 번 데이터를 가져오면 항상 캐시 사용)
      ```javascript
        const { data } = useQuery({
          queryKey: [...],
          queryFn: fn,
          staleTime: 60 * 1000, // fresh -> stale, 단위 ms
        });
      ```
    * ***Fresh***일 동안에는 서버에서 데이터를 다시 가져오지 않음
  * `Stale`   
    * 데이터가 오래됐음을 의미, 새 데이터를 fetching 할 수 있음.
    * ***기회***가 되면 항상 데이터를 가져와라. 
      * RQ Provider에서 ***QueryClient***를 통해 전역 설정하거나, `useQuery`에서 따로 설정 가능(덮어씌워짐)
        * `refetchOnWindowFocus`*: 탭 전환 후 돌아오는 경우 
        * `retryOnMount`*: 컴포넌트 unmount 됐다가 mount 된 경우 
        * `refetchOnReconnect`*: 인터넷 연결이 끊겼다가 다시 접속됨 
        * `retry`: 데이터 가져오기 실패 시 재시도 횟수 
        * *표시된 3가지의 경우에 다시 가져옴
    * 사용자의 의도!! (캐시를 얼마나 오래 간직할지 의도). 
  * `Inactive`   
    * 사용되고 있지 않은 상태. 일정시간이 지나면 캐시에서 삭제될 수 있음.
    * 화면에서 키 관련 데이터를 사용하고 있는지 확인. 
    * gcTime이 시작됨(가비지콜렉터 타임 / 5분이 기본)
    * Inactive 상태였다가 화면에 보이는 순간 캐시에서 데이터를 불러옴. 하지만 설정된 gcTime이 지나서 메모리가 정리되면 데이터를 새로 불러와야 함. 
    * gcTime > staleTime.
    ```javascript
      const { data } = useQuery({
        queryKey: [...],
        queryFn: fn,
        staleTime: 60 * 1000,
        gcTime: 300 * 1000, // gcTime > staleTime
      });
    ```
  * `Fetching`   
    * 데이터를 가져오는 순간. 
    * 순간적인 상황이라 상태 변화를 확인하기 힘듦.
  * `Paused`   
    * 오프라인(인터넷 연결 없음) 등의 경우 데이터를 가져오는 것을 잠시 멈춘 상태. 


### 3. Actions

  * `Refetch`   
    * 데이터를 무조건 새로 가져옴. 
    * Invalidate가 효율적인데 Refetch가 필요한 이유?
      * 화면에 필요하진 않지만 데이터가 필요할 경우도 있음!
  * `Invalidate`   
    * 현재 화면에서 데이터를 사용하고 있을 때만 가져옴.
      * RQ Devtools의 Observers 수가 0이 아닐 때
      * Inactive일 경우에는 가져오지 않음. 
      * Refetch 보다는 좀 더 효율적인 방식. 
  * `Reset`   
    * initialData가 있고, 해당 값으로 돌리고 싶을 경우 사용.
    ```javascript
      const { data } = useQuery({
        queryKey: [...],
        queryFn: fn,
        ...,
        initialData: () => [],
      })
    ```
  * `Remove`   
    * 데이터 제거. 
    * 새로고침 시 다시 가져옴.
  * `Trigger Loading`   
    * 로딩 상태 확인하고 싶을 경우 사용.
  * `Trigger Error`   
    * 에러 상태 확인하고 싶을 경우 사용.


### 4. React-Query SSR 설정

  1. RQ Provider 컴포넌트 생성 (하위 컴포넌트에서는 모두 state 공유 가능)
  2. 서버로부터 Fetching한 데이터를 공유하고 싶은 컴포넌트에 RQ Provider로 감싸줌
  3. 데이터 fetching이 필요한 컴포넌트에서 ***QueryClient*** 인스턴스를 생성하고 `prefetchQuery`를 실행
  ```javascript
    const queryClient = new QueryClient();

    // queryKey를 가진 경우에 queryFn 함수를 실행해서 데이터를 받아와라!
    queryClient.prefetchQuery({ queryKey, queryFn })
  ```   
  * queryFn (데이터를 가져오는 비동기 함수)   
    * Next.js에서 옵션으로 tags를 지원
      * 캐싱 설정을 해뒀을 때, 새로운 데이터를 적절하게 업데이트하기 위한 키
    * 데이터 fetching 후 받아온 결과 데이터를 자동으로 저장함!
      * `cache: 'no-store'`: 자동 저장을 원하지 않을 경우   
        (캐싱 원하지 않음 / 매번 서버에서 데이터 가져오기)
    * 캐시 초기화 가능
      * `revalidateTag`: Next.js의 tags를 인자로 보내, 관련 캐시 초기화
      * `revalidatePath`: 인자로 들어갈 페이지에 접속할 때, 관련 캐시 초기화   

    ```javascript
      async function queryFnName() {
        const res = await fetch('http://api.request.url', {
          next: { 
            tags: ['posts', 'recommends'], 
          },  
          // cache: 'no-store',
        });

        // revalidateTag('recommends')
        // revalidatePath('/home')

        return res.json();
      }
    ```   
  4. 서버에서 불러온 데이터를 클라이언트의 React Query가 물려받는다 (Hydrate 한다)   
    1) 데이터를 불러오고 나면 dehydrate 해준다.   
    2) 위의 데이터를 RQ가 hydarate 한다. (서버에서 온 데이터를 클라이언트에서 형식 맞춰서 그대로 물려받는 것)   
      ```jsx
        // 4-1
        const dehydrateState = dehydrate(queryClient);

        ...

        // 4-2
        <HydrationBoundary state={dehydrateState}>
          ...
        </HydrationBoundary>
      ```   


### 5. 클라이언트 React-Query

  * Prefetching 된 데이터를 `useQuery`를 사용해 불러옴   
  ```javascript
    const { data, error, isLoading } = useQuery({ 
      queryKey: [...], 
      queryFn: fn,  // queryKey 값이 queryFn의 파라미터로 알아서 넘겨짐!
      ..., 
      // staleTime,
      // gcTime,
      // initialData,
      // enabled,   // 값에 따라 조회 여부 결정
    });
  ```   


### 6. API

  * `prefetchQuery`
    * SSR 위함 (SEO)
    * 사용자가 데이터를 필요로 하기 전에 미리 데이터를 fetching 해두는 것
  * `prefetchInfiniteQuery`
    * 무한 스크롤링 쉽게 구현 가능
    * ***initialPageParam*** 속성을 꼭 넣어줘야 한다!
    ```javascript
      const queryClient = new QueryClient();
      await queryClient.prefetchInfiniteQuery({
        queryKey: [...],
        queryFn: fn,  // 파라미터로 pageParam이 알아서 넘겨짐!
        initialPageParam: 0,
      });
    ```
  * `useQuery`
    * 조회
    * 기존에 가져온게 없을 경우 새로 불러옴
  * `useInfiniteQuery`

    ```javascript
      const { 
        data, 
        fetchNextPage, 
        hasNextPage, 
        isFetching, 
        isPending, 
        isLoading, 
      } = useInfiniteQuery({
        queryKey: [...],
        queryFn: fn,  // 파라미터로 pageParam이 알아서 넘겨짐!
        initialPageParam: 0,
        getNextPageParam: (lastPage) => lastPage.at(-1)?.id,
        ...
      });
    ```
    * 결과
      * ***data*** 내 pages 값이 존재하고(data.pages), 이를 2차원 배열로 관리함   
        ex. [[게시글1, 2, 3, 4, 5], [6, 7, 8, 9, 10], [11, 12, 13]]
      * ***fetchNextPage***
        * intersection-observer로 이벤트가 발생하면, 다음 데이터 불러오는 함수
        * [참고1] 확인
      * ***hasNextPage***
        * 다음 페이지가 있으면 ***true***, 없으면 ***false***
        * 페이지 당 element 개수로 다음 페이지가 있는지 없는지 파악함   
          ex. [게시글1, 2, 3, 4, 5], [6, 7, 8, 9, 10], [11, 12]   
          : [11, 12]는 5개가 아니기때문에, 다음 페이지 없음! -> false 반환
      * ***isFetching***
        * 데이터를 가져오는 순간 ***true***
      * ***isPending***
        * 완전 처음(데이터를 불러오지 않았을 때)엔 ***true*** 
      * ***isLoading***
        * isPending && isFetching
        * 둘 다 true일 경우에만 ***true***
    * 파라미터
      * ***initialPageParam***, ***getNextPageParam*** 속성 넣어줘야 함
      * ***getNextPageParam***
        * 함수 형태
        * 파라미터로 현재 페이지 리스트
        * 현재 페이지의 마지막 index 리턴
  * `useSuspenseQuery` / `useSuspenseInfiniteQuery`
    * 데이터를 불러올 때 `<Suspense>`를 인식해 fallback 실행함
    * [참고2] 확인
  * `useQueryClient`
    * ***QueryClient*** 인스턴스에 접근해, 캐시 조작 및 쿼리 관련 다양한 작업 수행
  * `getQueryData` / `setQueryData`
    * 서버에서 불러온 데이터 가져오기/수정하기
  * `useMutation`
    * 상태관리 가능 (로딩/성공/에러)!
      * Pending
        * 초기! 데이터를 아직 안 불러온 상태
        * Fetching + 처음 가져오는 것
        * 요청을 보낸 후 버터 fetching이 완료될 때까지의 상태   
        (fetching 상태를 포함)
      * Fetching
        * 데이터를 불러오려고 하는 상태
        * 실제로 데이터를 가져오고 있는 상태
    * Optimistic Update (긍정적 업데이트) : 반응속도를 빠르게 하도록
      * 성공했다고 간주하고 화면에 바로 표시해줌
      * 사용자가 로딩 화면을 보는 시간이 최소화
      * BUT) 에러가 날 수 있는 상황에서는 위험..!
    * `mutationFn`
      * 요청만 담당
      * 성공/실패 처리는 React Query에 맡기
    * `onMutate`
      * mutationFn이 호출됐을 때 실행
      * ***queryClient.getQueryCache()*** 를 이용하면 현재 페이지에 캐싱된 데이터(RQ-devtools에서 확인 가능한 데이터)를 조회할 수 있고, 이로부터 쿼리 키를 전부 불러올 수 있다.
        ```javascript
          const queryCache = queryClient.getQueryCache();
          const queryKeys = queryCache.getAll().map((cache) => cache.queryKey);
        ```
      * 쿼리 키는 대분류 > 중분류 > 소분류 순으로 정하는 것이 좋음 (구분이 용이해짐)
    * `onSuccess`
      * 성공했을 때 실행
      * 파라미터: (response, variable, context)   
        [ fetch에 대한 response, mutationFn의 파라미터, onMutate 리턴값 ]
    * `onError`: 실패했을 때 실행
    * `onSettled`
      * 성공/실패 둘 중 어느 것이든 끝났을 때 실행 (onSuccess/onError 이후 한 번 더 호출되는 함수)
      * ***queryClient.invalidateQueries({ queryKey: ['key'] })***
        * *Optional* : 필요에 따라 작성
        * 주기적으로 데이터를 새로고침하고 싶을 경우
        * 해당 쿼리 키를 가진 캐시 데이터를 제거 후 새로운 데이터 불러옴
    ```javascript
      const mutationFnName = useMutation({
        mutationFn: async (variable) => { 
          return fetch(...); // fetch에 대한 응답 데이터: response 
        },
        onMutate(variable) { 
          return 123;     // onMutate 리턴값: context
        },
        async onSuccess(response, variable, context) {},
        onError(error, variable, context) {},
        // onSettled: (response, error, variable, context) {},
      });
    ```
    * 생성, 수정, 삭제 ...???<br><br>

<hr>

#### *[참고1] Intersection Observer*
  
  * 브라우저 최하단에 가상의 태그를 설치 후 스크롤을 내림에 따라 해당 태그가 노출되면, 이벤트를 발생시키는 것.
  * 무한 스크롤링에 사용 (scrollHeight 사용은 옛스러운 방식)
  * react-intersection-observer 라이브러리 사용!
  ```javascript
    import { useInVidew } from 'react-intersection-observer';

    ...

    const { ref, inView } = useInView({
      threshold: 0, // ref 박스가 몇 px 노출되었을 때 호출?
      delay: 0,     // ref 박스가 보이고 몇 초 후에 호출?
    });

    useEffect(() => {
      if (inView) {
        !isFetching && hasNextpage && fetchNextPage();
      }
    }, [inView, isFetching, hasNextPage, fetchNextPage]);

    return (
      ...

      <div ref={ref} style={{ height: 0 }} />
    );
  ```


#### *[참고2] 로딩/에러 파일 처리*

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
    * ***추천*** : useSuspenseQuery/useSuspenseInfiniteQuery를 사용해 상위 Suspense에 걸리도록 (isPending 미사용)
    * React-Query의 isPending, 별도 로딩화면 사용 (로딩화면이 중복 사용되는 단점)<br><br>

<hr>


# Zustand

  * Redux의 간단한/미니 버전
  * 간단하게 컴포넌트 간 상태 공유 가능
  * Context API에 비해 기본적으로 최적화가 적용되어있음 (ContextAPI: 직접 최적화)
  * React Query에서도 *같은 Key 사용 + staleTime, gcTime 최대한으로 늘려서* 상태 공유가 가능하지만, React Query의 주목적은 데이터를 가져오는 것!

### 1. Store

  * 설치 후, /store 폴더 내 필요한 store hooks 생성해 관리
  * zustand의 create 함수를 이용해 공유하고 싶은 state와 setState 작성
    * create는 set 함수를 매개변수로 가지고 있음
  ```javascript
    export const useModalStore = create((set) => ({
      mode: 'new',          // 'new' | 'comment'
      data: null,           // Post | null
      setMode(mode) {
        set({ mode });      // set은 객체 형식으로!
      },
      setData(data) {
        set({ data });
      },
      reset() {
        set({
          mode: 'new',
          data: null,
        })
      }
    }));
  ```
  * 원하는 컴포넌트에서 store hook을 이용해 상태를 저장하고, 다른 컴포넌트에서 저장된 상태를 사용할 수 있음
  ```javascript
    const modalStore = useModalStore();

    ...

    // modalStore.mode로 접근 가능
    // modalStore.data로 접근 가능
    modalStore.setMode('comment');
    modalStore.setData(post);
    modalStore.reset();
  ```

# 캐싱

  * https://nextjs.org/docs/app/building-your-application/caching 참고
    * 그림에서 Data Source를 백엔드 서버라고 생각하면 이해하기 편함
  * 다양한 캐싱 전략 도입을 고려할 필요성
    * Next13 App Router 부터는 서버 컴포넌트의 등장으로 프론트 서버에 부하가 상당히 커졌음
  * Build Time일 경우 최대한 최적화를 많이 하는게 좋다
    * Build Time : 배포 전 빌드할 경우
    * Request Time : 배포 이후 사용자로부터 요청이 왔을 경우

### 1. Request Memoization

  * 페이지를 렌더링할 때 중복된 요청이 있으면 제거해주는 것 ( 한 번만 보냄 )
  * **Duration** : 한 페이지 렌더링
  * **Revalidating** : 필요 x (한 페이지 렌더링 이후엔 알아서 새로운 요청을 보내기 때문)

### 2. Data Cache

  * 프론트 서버에서 백엔드 서버로 보낸 요청에 대한 응답을 얼마나 오랫동안 캐싱(기억)할 것인지
  * **Duration** : 계속 유지 *( 새로고침 / { cache: 'no-store' }을 사용하지 않는다면 )*
  * **Revalidating**
    * 시간 지정 : { next: { revalidate: 3600 } }
    * 수동 Revalidation
      * by tag : revalidateTag('posts')
      * by path : revalidatePath('/home')
  * **Opting out**
    * `{ cache: 'no-store' }` ( Data Cache를 캐싱(기억)하지 않겠다! )
    * 써드파티 라이브러리에서의 요청을 캐싱하지 않으려면 페이지 파일 최상단에 아래와 같이 선언
      ```javascript
        export const dynamic = 'force-dynamic';
      ```

### 3. Full Route Cache

  * 각 페이지를 빌드 타임에 만들어두는데, 이를 얼마동안 캐싱할것인지.
  * 매 번 새로고침할 때마다 페이지 내 구성요소들이 변하는게 있으면 안됨.
    * 업데이트 되는 내용이 있다면, Full Route Cache도 갱신이 됨.
    * SNS 앱 같은 경우에는 컨텐츠들이 계속 변하므로 적합하진 않음.
    * ***정적인 페이지일 경우에만 의미가 있음***
  * **Duration** : 계속 유지
  * **Invalidation(소멸)** : Date Cache가 수정될 때 / 재배포(빌드가 되므로)될 때
  * **Opting out** : Dynamic Function을 쓰면 Full Route Cache는 동작하지 않음
    * Dynamic Function : cookies, headers, useSearchParams, searchParams
  
### 4. Router Cache

  * 유일하게 클라이언트에서 동작 ( layout / page )
  * 컴포넌트 별로 캐싱 (한 번 받아온 layout 같은 경우 재사용)
  * **Duration**
    * 페이지를 새로고침하기 전 까지는 유지
    * Static : 5분 ( Data Cache 사용 & Dynamic Functions 미사용 )
    * Dynamic: 30초
    * 뉴스/블로그 글의 경우가 아닌 이상 대부분 Dynamic!
      * Static 처럼 사용하고 싶을 경우, `prefetch={true}` 추가하거나 `router.prefetch`를 호출
        ```html
        <Link ... prefetch={true}>
        ```
  * **Invalidation**
    * relvalidatePath, revalidateTag
    * cookies.set, cookies.delete
    * router.refresh()
  * **Opting out**
    * Router Cache는 끌 수 없음
    * 기본적으로 30초 ( 사용하지 않으려면 Invalidation 해야함 )


# 배포

### 1. 배포 모드

  * Static 모드
    * next.config.js 내 nextConfig에 `output: 'export'`가 포함된 경우
    * Next 서버 없이 html 페이지들로만 이루어진 정적인 사이트
      * 빌드할 때 모든게 결정됨, 컨텐츠가 바뀌면 그 때마다 다시 빌드해야함
    * 블로그, 뉴스 글을 다루는 사이트에 적합
  * ~~ISR(Incremental Static Regeneration) 모드~~
    * 서버를 하나 두고, 일정 주기로 업데이트 된 컨텐츠가 있는지 검사해서 html 페이지를 다시 만들거나 추가
    * 매번 다시 빌드하는 것을 막아주는 모드
    * App Router에서는 Full Router Cache & Data Cache Revalidating으로 구현
  * Dynamic 모드