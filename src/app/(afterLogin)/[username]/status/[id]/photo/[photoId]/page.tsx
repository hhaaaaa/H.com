import Home from '@/app/(afterLogin)/home/page';

type Props = {
  params: { username: string; id: string; photoId: string };
};

// slug들의 값을 params로 받아올 수 있음 : 현재 위치에선 [username], [id], [photoId]
export default function Page({ params }: Props) {
  params.username; // elonmusk
  params.id; // 1
  params.photoId; // 1
  return <Home />;
}
