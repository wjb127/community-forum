"use client";

import { useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Link from 'next/link';
import useSWR, { mutate } from 'swr';

// 게시물 타입 정의
interface PostType {
  id: number;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
}

export default function Home() {
  const { data: posts, error, isLoading } = useSWR('posts', async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  });

  useEffect(() => {
    const subscription = supabase
      .channel('public:posts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' },
        (payload) => {
          console.log('New post added:', payload);
          mutate('posts');  // 실시간 데이터 반영
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);  // 구독 해제
    };
  }, []);

  if (isLoading) return <p>로딩 중...</p>;
  if (error) return <p>데이터를 가져오는 중 오류 발생: {error.message}</p>;

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
      {posts && posts.length > 0 ? (
        <ul>
          {posts.map((post: PostType) => (
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
