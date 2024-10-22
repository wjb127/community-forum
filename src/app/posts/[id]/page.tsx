'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export default function PostDetail({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchPost = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Error fetching post:', error);
    } else {
      setPost(data as Post);
    }

    setLoading(false);
  };

  const deletePost = async () => {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting post:', error);
    } else {
      router.push('/'); // 삭제 후 홈으로 리다이렉트
    }
  };

  useEffect(() => {
    fetchPost();
  }, [params.id]);

  if (loading) return <p className="text-center text-gray-500">로딩 중...</p>;
  if (!post) return <p className="text-center text-red-500">게시글을 찾을 수 없습니다.</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      <p className="text-gray-700 mb-6">{post.content}</p>
      <p className="text-sm text-gray-400 mb-8">{new Date(post.created_at).toLocaleString()}</p>

      {/* 버튼 그룹 */}
      <div className="flex space-x-4">
        {/* 수정 버튼 */}
        <Link href={`/posts/${post.id}/edit`}>
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded">
            수정하기
          </button>
        </Link>

        {/* 삭제 버튼 */}
        <button
          onClick={deletePost}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
        >
          삭제하기
        </button>

        {/* 게시판 홈페이지로 이동 버튼 */}
        <Link href="/">
          <button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded">
            게시판 홈페이지로 이동
          </button>
        </Link>
      </div>
    </div>
  );
}
