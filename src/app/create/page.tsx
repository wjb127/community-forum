'use client';

import React, { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('free'); // 초기값은 자유게시판
  const router = useRouter();

  const createPost = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase
      .from('posts')
      .insert([{
        title,
        content,
        category, // 선택된 카테고리 저장
        created_at: new Date().toISOString(), // 현재 시각을 ISO 포맷으로 저장
      }]);

    if (error) {
      console.log('Error creating post:', error);
    } else {
      router.push('/');
    }
  };

  const cancelCreation = () => {
    const confirmCancel = window.confirm("작성 중인 내용을 취소하시겠습니까?");
    if (confirmCancel) {
      router.push('/'); // 취소 확인 시 홈으로 이동
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">새 글 작성</h1>
      <form onSubmit={createPost} className="space-y-4">
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
        
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
        >
          작성
        </button>
      </form>

      {/* 게시판 홈페이지로 돌아가는 버튼 */}
      <div className="block mt-4 text-center">
        <button
          onClick={cancelCreation}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
        >
          취소
        </button>
      </div>
    </div>
  );
}
