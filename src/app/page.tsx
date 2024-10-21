import { supabase } from '../../lib/supabaseClient';
import Link from 'next/link';

// 게시물 타입 정의
interface PostType {
  id: number;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
}

// Home 함수
export default async function Home() {
  // 게시물 데이터 가져오기
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
   // .order('created_at');
  // 에러 발생 시 에러 메시지 출력
  console.log('Fetched posts:', posts);
  if (error) {
    console.log('Error fetching posts:', error);
   return <p>Error fetching posts</p>;
  }


  // posts가 있을 경우 타입을 PostType[]으로 명시적으로 설정
  const postList: PostType[] = posts || [];

  return (
    <div>
      <h1>게시판</h1>

      {/* 게시물 추가 버튼 */}
      <div>
        <Link href="/create">
          <button style={{ backgroundColor: 'blue', color: 'white', padding: '10px', margin: '10px 0' }}>
            게시물 추가
          </button>
        </Link>
      </div>

      {/* 게시글 목록 */}
      {postList.length > 0 ? (
        <ul>
          {postList.map((post: PostType) => (
            <li key={post.id}>
              <Link href={`/posts/${post.id}`}>
                {post.title}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>게시물이 없습니다. 게시물을 추가해 주세요!</p>
      )}
    </div>
  );
}
