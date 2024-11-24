"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useDarkMode } from "../../context/DarkModeContext";
import Link from "next/link";
import useSWR, { mutate } from "swr";

// 게시물 타입 정의

interface PostType {
  id: number;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  category: string;
  likes: number; // 좋아요 추가
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("latest");
  const [selectedCategory, setSelectedCategory] = useState("free");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchOption, setSearchOption] = useState("title"); // 검색 옵션 상태 관리
  const { darkMode, toggleDarkMode } = useDarkMode();
  const postsPerPage = 10;
  const [appliedSearchTerm, setAppliedSearchTerm] = useState(""); // 검색어 적용 상태 관리

  // 데이터 가져오기
  const {
    data: posts,
    error,
    isLoading,
  } = useSWR(
    ["posts", sortOrder, appliedSearchTerm, searchOption],
    async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: sortOrder !== "latest" });

      if (error) throw error;
      return data;
    }
  );

  const handleLike = async (postId: number, currentLikes: number) => {
    mutate(
      "posts",
      (posts: PostType[] = []) =>
        posts.map((post) =>
          post.id === postId ? { ...post, likes: currentLikes + 1 } : post
        ),
      false
    );

    const { error } = await supabase
      .from("posts")
      .update({ likes: currentLikes + 1 })
      .eq("id", postId);

    if (error) {
      console.log("Error updating likes:", error);
      mutate(
        "posts",
        (posts: PostType[] = []) =>
          posts.map((post) =>
            post.id === postId ? { ...post, likes: currentLikes } : post
          ),
        false
      );
    } else {
      mutate("posts");
    }
  };

  const handleSearch = () => {
    setAppliedSearchTerm(searchTerm); // 검색 버튼 클릭 시에만 검색어를 적용
  };

  const handleResetSearch = () => {
    setAppliedSearchTerm(""); // 검색어 초기화
    setSearchTerm(""); // 검색창도 초기화
    setCurrentPage(1); // 페이지도 초기화
  };

  // 검색 옵션에 따라 필터링 방식 결정
  const filteredPosts = posts
    ?.filter((post: PostType) => {
      const searchLower = appliedSearchTerm.toLowerCase();
      if (searchOption === "title") {
        return (
          post.title.toLowerCase().includes(searchLower) &&
          post.category === selectedCategory
        );
      } else {
        // 제목 + 내용 검색
        return (
          (post.title.toLowerCase().includes(searchLower) ||
            post.content.toLowerCase().includes(searchLower)) &&
          post.category === selectedCategory
        );
      }
    })
    .sort((a, b) => {
      if (sortOrder === "latest") {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      } else if (sortOrder === "oldest") {
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      } else if (sortOrder === "title") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

  const paginatedPosts = filteredPosts?.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  const totalPages = Math.ceil((filteredPosts?.length || 0) / postsPerPage);

  if (isLoading) return <p className="text-center text-gray-500">로딩 중...</p>;
  if (error)
    return (
      <p className="text-center text-red-500">오류 발생: {error.message}</p>
    );

  return (
    <div
      className={`max-w-4xl mx-auto p-4 ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-black"
      }`}
    >
      <h1 className="text-3xl font-bold text-center mb-6">
        <Link href="/" onClick={handleResetSearch}>
          게시판
        </Link>
      </h1>

      {/* 게시판 종류 탭 및 다크모드 토글 버튼 */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-4">
          <button
            onClick={() => setSelectedCategory("free")}
            className={`px-4 py-2 font-bold rounded ${
              selectedCategory === "free"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            자유게시판
          </button>
          <button
            onClick={() => setSelectedCategory("secret")}
            className={`px-4 py-2 font-bold rounded ${
              selectedCategory === "secret"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            비밀게시판
          </button>
        </div>
        <button
          onClick={toggleDarkMode}
          className="px-4 py-2 font-bold rounded bg-gray-500 hover:bg-gray-600 text-white"
        >
          {darkMode ? "라이트 모드" : "다크 모드"}
        </button>
      </div>

      {/* 검색 옵션 선택 및 검색 입력 필드 */}
      <div className="mb-4 flex items-center space-x-2">
        <select
          value={searchOption}
          onChange={(e) => setSearchOption(e.target.value)}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="title">제목</option>
          <option value="titleContent">제목 + 내용</option>
        </select>
        <input
          type="text"
          placeholder="검색어 입력"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          className="flex-grow p-2 border border-gray-300 rounded-lg"
        />

        <button
          onClick={handleSearch}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          검색
        </button>

      </div>

      {/* 정렬 드롭다운과 게시물 추가 버튼 */}
      <div className="flex justify-between items-center mb-4">
        <div className="relative inline-block">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white shadow focus:outline-none"
          >
            <option value="latest">최신순</option>
            <option value="oldest">오래된 순</option>
            <option value="title">제목순</option>
          </select>
        </div>
        <Link href="/create">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            게시물 추가
          </button>
        </Link>
      </div>

      {/* 게시글 목록 */}
      {paginatedPosts && paginatedPosts.length > 0 ? (
        <ul className="space-y-4">
          {paginatedPosts.map((post: PostType) => (
            <li
              key={post.id}
              className={`p-4 rounded-lg shadow-md hover:bg-gray-200 transition cursor-pointer ${
                darkMode ? "bg-gray-800" : "bg-gray-100"
              }`}
            >
              <Link href={`/posts/${post.id}`}>
                <div>
                  <span className="text-xl font-semibold text-blue-600 hover:underline">
                    {post.title}
                  </span>
                  <p className="text-sm text-gray-500">
                    {new Date(post.created_at).toLocaleString()}
                  </p>
                </div>
              </Link>
              <div className="mt-2 flex items-center">
                <button
                  onClick={() => handleLike(post.id, post.likes)}
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  👍 {post.likes} 좋아요
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-500">
          게시물이 없습니다. 게시물을 추가해 주세요!
        </p>
      )}

      {/* 페이지네이션 */}
      <div className="flex justify-center mt-6">
        {Array.from({ length: totalPages }, (_, index) => index + 1).map(
          (page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`mx-1 px-3 py-1 border ${
                page === currentPage
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              } rounded`}
            >
              {page}
            </button>
          )
        )}
      </div>
    </div>
  );
}
