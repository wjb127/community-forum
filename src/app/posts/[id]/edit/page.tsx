'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function EditPost({ params }: { params: { id: string } }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('free'); // 초기값으로 자유게시판 설정
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
        setCategory(data.category); // 기존 카테고리 값 가져오기
      }
    };

    fetchPost();
  }, [params.id]);

  const updatePost = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase
      .from('posts')
      .update({ title, content, category }) // 선택된 카테고리로 업데이트
      .eq('id', params.id);

    if (error) {
      console.log('Error updating post:', error);
    } else {
      router.push(`/posts/${params.id}`);
    }
  };

  const cancelEdit = () => {
    router.push(`/posts/${params.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">게시글 수정</h1>
      <form onSubmit={updatePost} className="space-y-4">
        <input
          type="text"
          placeholder="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* 카테고리 선택 드롭다운 */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="free">자유게시판</option>
          <option value="secret">비밀게시판</option>
        </select>

        <textarea
          placeholder="내용"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          className="w-full h-40 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex space-x-4">
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            수정
          </button>
          <button
            type="button"
            onClick={cancelEdit}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}
