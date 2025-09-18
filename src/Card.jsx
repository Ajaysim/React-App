import React from "react";

const Card = ({ post, onDelete }) => {
  return (
    <div className="card">
      <img src={`https://picsum.photos/id/${post.id}/200/150`} alt="post" />
      <h3>{post.title}</h3>
      <p>{post.body}</p>
      <button className="delete" onClick={() => onDelete(post.id)}>❌</button>
    </div>
  );
};

export default Card;
