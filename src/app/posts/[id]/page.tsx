"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  category: string;
  likes: number;
}

interface Comment {
  id: string;
  post_id: string;
  user_id: string | null;
  content: string;
  created_at: string;
}

export default function PostDetail({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchPost = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      console.error("Error fetching post:", error);
    } else if (data) {
      setPost(data as Post);
    }
    setLoading(false);
  };

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", params.id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching comments:", error);
    } else if (data) {
      setComments(data as Comment[]);
    }
  };

  const handleLike = async () => {
    if (!post) return;
    setPost((prev) => (prev ? { ...prev, likes: prev.likes + 1 } : prev));

    const { error } = await supabase
      .from("posts")
      .update({ likes: (post.likes || 0) + 1 })
      .eq("id", post.id);

    if (error) {
      console.error("Error updating likes:", error);
      setPost((prev) => (prev ? { ...prev, likes: prev.likes - 1 } : prev));
    }
  };

  const checkUserExists = async (userId: string) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/users?select=id&id=eq.${userId}`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${
            (
              await supabase.auth.getSession()
            )?.data?.session?.access_token
          }`,
          Accept: "application/json",
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data.length > 0;
    } else {
      console.warn(
        "User ID not found in 'users' table. Setting user_id to null."
      );
      return false;
    }
  };

  const addComment = async () => {
    if (newComment.trim() === "") return;

    const { data: userSession } = await supabase.auth.getUser();
    let userId = null;

    if (userSession.user) {
      const userExists = await checkUserExists(userSession.user.id);
      if (userExists) {
        userId = userSession.user.id;
      }
    }

    const optimisticComment: Comment = {
      id: `${Date.now()}`, // 임시 ID
      post_id: params.id,
      user_id: userId,
      content: newComment,
      created_at: new Date().toISOString(),
    };

    // 프론트엔드에 댓글 즉시 반영
    setComments((prevComments) => [...prevComments, optimisticComment]);
    setNewComment(""); // 입력 필드 초기화

    // 서버에 댓글 삽입
    const { data: commentDataResponse, error } = await supabase
      .from("comments")
      .insert([{ post_id: params.id, content: newComment, user_id: userId }]);

    if (error) {
      console.error("Error adding comment:", error);
      setComments((prevComments) =>
        prevComments.filter((comment) => comment.id !== optimisticComment.id)
      ); // 오류 발생 시 댓글 제거
    } else if (commentDataResponse && commentDataResponse[0]) {
      setComments((prevComments) => [
        ...prevComments.slice(0, -1),
        commentDataResponse[0],
      ]); // 최종 데이터 반영
    }
  };

  const deletePost = async () => {
    const confirmDelete = window.confirm("삭제하시겠습니까?");
    if (!confirmDelete) return;

    const { error } = await supabase.from("posts").delete().eq("id", params.id);

    if (error) {
      console.error("Error deleting post:", error);
    } else {
      router.push("/");
    }
  };

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [params.id]);

  if (loading) return <p className="text-center text-gray-500">로딩 중...</p>;
  if (!post)
    return (
      <p className="text-center text-red-500">게시글을 찾을 수 없습니다.</p>
    );

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <p className="text-sm font-semibold text-gray-600 mb-2">
        {post.category === "free" ? "자유게시판" : "비밀게시판"}
      </p>
      <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
      <p className="text-sm text-gray-400 mb-6">
        {new Date(post.created_at).toLocaleString()}
      </p>
      <p className="text-gray-700 mb-8">{post.content}</p>

      <div className="mb-8 flex items-center space-x-2">
        <button
          onClick={handleLike}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          👍 좋아요
        </button>
        <span className="text-gray-700 font-semibold">{post.likes}명</span>
      </div>

      <div className="border-t pt-4 mt-4">
        <h2 className="text-2xl font-semibold mb-4">댓글</h2>

        {comments.length > 0 ? (
          <ul className="space-y-4">
            {comments.map((comment) => (
              <li key={comment.id} className="border-b pb-2">
                <p className="text-gray-600">{comment.content}</p>
                <p className="text-xs text-gray-400">
                  {new Date(comment.created_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">댓글이 없습니다.</p>
        )}

        <div className="mt-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="댓글을 입력하세요..."
            className="w-full p-2 border rounded"
          />
          <button
            onClick={addComment}
            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            댓글 작성
          </button>
        </div>
      </div>

      <div className="flex space-x-4 mt-6">
        <Link href={`/posts/${post.id}/edit`}>
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded">
            수정
          </button>
        </Link>
        <button
          onClick={deletePost}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
        >
          삭제
        </button>
        <Link href="/">
          <button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded">
            목록
          </button>
        </Link>
      </div>
    </div>
  );
}
