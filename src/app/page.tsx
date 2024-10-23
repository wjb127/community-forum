"use client";

import { useState, useEffect } from 'react';
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

// 게시물 목록 페이지
export default function Home() {
  // 검색어 상태 관리
  const [searchTerm, setSearchTerm] = useState('');

  // useSWR 훅을 사용해 데이터 가져오기
  const { data: posts, error, isLoading } = useSWR('posts', async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  });

  // 실시간 데이터 반영을 위한 구독 설정
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

  // 검색된 게시글 필터링
  const filteredPosts = posts?.filter((post: PostType) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <p className="text-center text-gray-500">로딩 중...</p>;
  if (error) return <p className="text-center text-red-500">데이터를 가져오는 중 오류 발생: {error.message}</p>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">게시판</h1>

      {/* 검색 입력 필드 */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="제목 검색"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg"
        />
      </div>

      {/* 게시물 추가 버튼 */}
      <div className="flex justify-end mb-4">
        <Link href="/create">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            게시물 추가
          </button>
        </Link>
      </div>

      {/* 게시글 목록 */}
      {filteredPosts && filteredPosts.length > 0 ? (
        <ul className="space-y-4">
          {filteredPosts.map((post: PostType) => (
            <li key={post.id} className="p-4 bg-gray-100 rounded-lg shadow-md hover:bg-gray-200 transition">
              <Link href={`/posts/${post.id}`}>
                <span className="text-xl font-semibold text-blue-600 hover:underline">{post.title}</span>
              </Link>
              <p className="text-sm text-gray-500">{new Date(post.created_at).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-500">게시물이 없습니다. 게시물을 추가해 주세요!</p>
      )}
    </div>
  );
}
