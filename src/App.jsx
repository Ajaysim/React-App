/*
ReactPostsPaginationApp.jsx
Single-file React app (default export) that implements the requirements:
- Fetches posts from https://jsonplaceholder.typicode.com/posts
- Shows Loading... for 5 seconds on startup
- Displays 6 cards per page with bottom pagination (page numbers, Prev, Next)
- Clicking a red cross removes the card from the global store and the view stays at 6 cards (shifts items from following pages)
- Clicking a page number jumps to that page
- Uses React Context API to store application state
- Each card shows a unique image using post id
*/

import React, { useEffect, useState, useContext, createContext, useMemo } from 'react';

const styles = {
  app: { fontFamily: 'Inter, Roboto, Arial, sans-serif', padding: 20, maxWidth: 1100, margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 700 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 },
  card: { position: 'relative', border: '1px solid #e3e3e3', borderRadius: 8, padding: 16, boxShadow: '0 2px 6px rgba(0,0,0,0.03)', background: '#fff' },
  cardTitle: { fontSize: 16, fontWeight: 600, marginBottom: 8 },
  cardBody: { fontSize: 14, color: '#333' },
  crossBtn: { position: 'absolute', top: 10, right: 10, border: 'none', background: 'transparent', cursor: 'pointer' },
  crossIcon: { width: 20, height: 20, display: 'inline-block', borderRadius: 3, lineHeight: '20px', textAlign: 'center', color: '#fff' },
  pagination: { display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center', marginTop: 22, flexWrap: 'wrap' },
  pageBtn: { padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' },
  pageBtnActive: { background: '#111827', color: '#fff', borderColor: '#111827' },
  navBtn: { padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' },
  loadingWrap: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', fontSize: 20 },
  footerInfo: { marginTop: 8, color: '#555', fontSize: 13, textAlign: 'center' }
};

const PostsContext = createContext(null);

function PostsProvider({ children }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let mounted = true;

    const fetchPosts = async () => {
      try {
        const fetchPromise = fetch('https://jsonplaceholder.typicode.com/posts?_limit=18').then(r => r.json());
        const delay = new Promise(resolve => setTimeout(resolve, 5000));
        const [data] = await Promise.all([fetchPromise, delay]);
        if (!mounted) return;
        const withImages = data.map(post => ({
          ...post,
          img: `https://picsum.photos/seed/${post.id}/400/250`
        }));
        setPosts(Array.isArray(withImages) ? withImages : []);
      } catch (err) {
        console.error('Failed to fetch posts', err);
        if (mounted) setPosts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchPosts();

    return () => { mounted = false; };
  }, []);

  const deletePost = (id) => {
    setPosts(prev => {
      const next = prev.filter(p => p.id !== id);
      const totalPages = Math.max(1, Math.ceil(next.length / 6));
      setCurrentPage(cp => Math.min(cp, totalPages));
      return next;
    });
  };

  const value = useMemo(() => ({ posts, loading, currentPage, setCurrentPage, deletePost }), [posts, loading, currentPage]);

  return <PostsContext.Provider value={value}>{children}</PostsContext.Provider>;
}

function usePosts() {
  const ctx = useContext(PostsContext);
  if (!ctx) throw new Error('usePosts must be used inside PostsProvider');
  return ctx;
}

function CrossIcon({ onClick }) {
  return (
    <button aria-label="Delete" title="Delete" onClick={onClick} style={styles.crossBtn}>
      <span style={{ ...styles.crossIcon, background: '#ef4444' }}>✕</span>
    </button>
  );
}

function Card({ post, onDelete }) {
  return (
    <div style={styles.card}>
      <CrossIcon onClick={() => onDelete(post.id)} />
      <img
        src={post.img}
        alt="Post"
        style={{ width: "100%", height: 150, objectFit: "cover", borderRadius: 6, marginBottom: 10 }}
      />
      <div style={styles.cardTitle}>{post.title}</div>
      <div style={styles.cardBody}>{post.body}</div>
    </div>
  );
}

function Pagination() {
  const { posts, currentPage, setCurrentPage } = usePosts();
  const totalPages = Math.max(1, Math.ceil(posts.length / 6));

  const pages = [];
  for (let i = 1; i <= totalPages; i++) pages.push(i);

  const goPrev = () => setCurrentPage(p => Math.max(1, p - 1));
  const goNext = () => setCurrentPage(p => Math.min(totalPages, p + 1));

  return (
    <div style={styles.pagination}>
      <button style={styles.navBtn} onClick={goPrev} disabled={currentPage === 1}>Prev</button>
      {pages.map(p => (
        <button
          key={p}
          onClick={() => setCurrentPage(p)}
          style={p === currentPage ? { ...styles.pageBtn, ...styles.pageBtnActive } : styles.pageBtn}
        >{p}</button>
      ))}
      <button style={styles.navBtn} onClick={goNext} disabled={currentPage === totalPages}>Next</button>
    </div>
  );
}

function PostsGrid() {
  const { posts, currentPage, deletePost } = usePosts();
  const perPage = 6;
  const totalPages = Math.max(1, Math.ceil(posts.length / perPage));
  const page = Math.min(currentPage, totalPages);
  const start = (page - 1) * perPage;
  const slice = posts.slice(start, start + perPage);

  return (
    <>
      <div style={styles.grid}>
        {slice.map(post => (
          <Card key={post.id} post={post} onDelete={deletePost} />
        ))}
      </div>
      <Pagination />
    </>
  );
}

export default function App() {
  return (
    <PostsProvider>
      <MainShell />
    </PostsProvider>
  );
}

function MainShell() {
  const { loading, posts } = usePosts();

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={styles.title}>Posts Viewer — 6 cards per page</div>
        <div style={{ color: '#666' }}>Total posts: {posts.length}</div>
      </header>
      {loading ? (
        <div style={styles.loadingWrap}>Loading... (will show for 5 seconds)</div>
      ) : (
        <PostsGrid />
      )}
      <div style={styles.footerInfo}>
        Tip: Click the red ✕ on a card to remove it. The view will keep showing up to 6 cards by shifting from the next pages.
      </div>
    </div>
  );
}