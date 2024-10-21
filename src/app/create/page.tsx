'use client';

import React, { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const router = useRouter();

  const createPost = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase
      .from('posts')
      .insert([{ title, content }]);

    if (error) {
      console.log('Error creating post:', error);
    } else {
      router.push('/');
    }
  };

  return (
    <div>
      <h1>새 글 작성</h1>
      <form onSubmit={createPost}>
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
        <button type="submit">작성하기</button>
      </form>
    </div>
  );
}
