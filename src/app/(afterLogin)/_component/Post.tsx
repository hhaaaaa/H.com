import style from './post.module.css';
import Link from 'next/link';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';
import ActionButtons from '@/app/(afterLogin)/_component/ActionButtons';
import PostArticle from '@/app/(afterLogin)/_component/PostArticle';
import { faker } from '@faker-js/faker';
import PostImages from '@/app/(afterLogin)/_component/PostImages';

dayjs.locale('ko');
dayjs.extend(relativeTime);

type Props = {
  noImage?: boolean;
};
export default function Post({ noImage }: Props) {
  const target = {
    postId: 1,
    User: {
      id: 'elonmusk',
      nickname: 'Elon Musk',
      image: '/x.jpg',
    },
    content: '클론코딩 라이브로 하니 너무 힘들어요 ㅠㅠ',
    createdAt: new Date(),
    Images: [] as any[],
  };

  if (Math.random() > 0.5 && !noImage) {
    target.Images.push(
      { imageId: 1, link: faker.image.urlLoremFlickr() },
      { imageId: 2, link: faker.image.urlLoremFlickr() },
      { imageId: 3, link: faker.image.urlLoremFlickr() },
      { imageId: 4, link: faker.image.urlLoremFlickr() }
    );
  }

  /* 
    서버 컴포넌트와 클라이언트 컴포넌트를 같이 쓰는 방법
    - 일부분만 클라이언트 컴포넌트로 뺌 (PostArticle)
    - 서버 컴포넌트 부분은 children으로 넣어주기
      : 부모(클라이언트 컴포넌트) 내에서 서버 컴포넌트를 import해서 쓰면 안 됨
        => 서버 컴포넌트가 클라이언트 컴포넌트로 성격이 변해버림
      : children/props로 넘겨주기
  */
  return (
    <PostArticle post={target}>
      <div className={style.postWrapper}>
        <div className={style.postUserSection}>
          <Link href={`/${target.User.id}`} className={style.postUserImage}>
            <img src={target.User.image} alt={target.User.nickname} />
            <div className={style.postShade} />
          </Link>
        </div>

        <div className={style.postBody}>
          <div className={style.postMeta}>
            <Link href={`/${target.User.id}`}>
              <span className={style.postUserName}>{target.User.nickname}</span>
              &nbsp;
              <span className={style.postUserId}>@{target.User.id}</span>
              &nbsp; · &nbsp;
            </Link>

            <span className={style.postDate}>
              {dayjs(target.createdAt).fromNow(true)}
            </span>
          </div>

          <div>{target.content}</div>

          <div>
            <PostImages post={target} />
          </div>

          <ActionButtons />
        </div>
      </div>
    </PostArticle>
  );
}
