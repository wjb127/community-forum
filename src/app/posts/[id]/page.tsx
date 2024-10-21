'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

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
      setPost(data as Post); // 타입을 명시적으로 Post로 변환
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

  if (loading) return <p>Loading...</p>;
  if (!post) return <p>No post found</p>;

  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      <p>{new Date(post.created_at).toLocaleString()}</p>

      {/* 삭제 버튼 */}
      <button onClick={deletePost} style={{ backgroundColor: 'red', color: 'white' }}>
        삭제하기
      </button>
    </div>
  );
}
