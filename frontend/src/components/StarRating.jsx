import React, { useState } from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';

const StarRating = ({ rating = 0, onRatingChange, readOnly = true, size = 18 }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = hoverRating || rating;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((index) => {
        const active = index <= displayRating;
        return (
          <button
            key={index}
            type="button"
            disabled={readOnly}
            className={`${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform duration-100'} text-amber-400`}
            onMouseEnter={() => !readOnly && setHoverRating(index)}
            onMouseLeave={() => !readOnly && setHoverRating(0)}
            onClick={() => !readOnly && onRatingChange && onRatingChange(index)}
          >
            {active ? <FaStar size={size} /> : <FaRegStar size={size} className="text-gray-300" />}
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
