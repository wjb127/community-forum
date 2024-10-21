'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function EditPost({ params }: { params: { id: string } }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) {
        console.log('Error fetching post:', error);
      } else {
        setTitle(data.title);
        setContent(data.content);
      }
    };

    fetchPost();
  }, [params.id]);

  const updatePost = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase
      .from('posts')
      .update({ title, content })
      .eq('id', params.id);

    if (error) {
      console.log('Error updating post:', error);
    } else {
      router.push(`/posts/${params.id}`);
    }
  };

  return (
    <div>
      <h1>게시글 수정</h1>
      <form onSubmit={updatePost}>
        <input
          type="text"
          placeholder="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="내용"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <button type="submit">수정하기</button>
      </form>
    </div>
  );
}
