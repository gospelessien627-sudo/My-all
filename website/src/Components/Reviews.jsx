import React, {  useState } from "react";
import { useEffect } from "react";
import { FaStar, FaTrash } from "react-icons/fa";
import "./Reviews.css";
import { useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const Reviews = () => {


    const navigate = useNavigate();
    const location = useLocation();
    const product = location.state?.product;
    const { productId } = useParams();
  const [reviews, setReviews] = useState([]);

  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(true);



  // ========================================
  // GET REVIEWS
  // ========================================

  const getReviews = async () => {
  try {

const response = await fetch(
  `https://davira-backend-api.vercel.app/reviews/${productId}`
);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    setReviews(data);

  } catch (error) {

    console.error("Error fetching reviews:", error);

  } finally {

    setLoading(false);

  }
};

    useEffect(() => {
  getReviews();
}, [productId]);



  // ========================================
  // ADD REVIEW
  // ========================================

  const submitReview = async (e) => {

    e.preventDefault();

    if (!name.trim() || !comment.trim()) {
      alert("Please fill in all fields");
      return;
    }

    try {

      const response = await fetch("https://davira-backend-api.vercel.app/reviews", {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
  productId: productId,
  productName: product?.name || "Product",
  name: name,
  rating: rating,
  comment: comment
})

        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      // Add new review to screen
      setReviews((previousReviews) => [
        data.review,
        ...previousReviews
      ]);

      // Clear form
      setName("");
      setRating(5);
      setComment("");

    } catch (error) {

      console.error(
        "Error submitting review:",
        error
      );

    }
  };


  // ========================================
  // DELETE REVIEW
  // ========================================

  const deleteReview = async (id) => {

    try {

      const response = await fetch(
  `https://davira-backend-api.vercel.app/reviews/${id}`,
  {
    method: "DELETE"
  }
);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setReviews((previousReviews) =>
        previousReviews.filter(
          (review) => review._id !== id
        )
      );

    } catch (error) {

      console.error(
        "Error deleting review:",
        error
      );

    }
  };


  // ========================================
  // AVERAGE RATING
  // ========================================

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce(
            (total, review) =>
              total + Number(review.rating),
            0
          ) / reviews.length
        ).toFixed(1)
      : "0.0";


  return (

    <div className="reviews-section">

        <button
  className="lod"
  onClick={() => navigate("/")}
>
    <FaArrowLeft className="arr"/>
  Back Home
</button>
      <h2>
        Customer Reviews
      </h2>


      {/* AVERAGE RATING */}

      <div className="average-rating">

        <h3>
          {averageRating}
        </h3>

        <div className="stars">

          {[1, 2, 3, 4, 5].map((star) => (

            <FaStar
              key={star}
              className={
                star <= Math.round(
                  Number(averageRating)
                )
                  ? "star active"
                  : "star"
              }
            />

          ))}

        </div>

        <p>
          {reviews.length} review
          {reviews.length !== 1 ? "s" : ""}
        </p>

      </div>


      {/* REVIEW FORM */}

      <div className="review-form">

        <h3>
          Leave a Review
        </h3>

        <form onSubmit={submitReview}>

          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
          />


          <div className="rating-input">

            <p>Your rating:</p>

            {[1, 2, 3, 4, 5].map((star) => (

              <FaStar
                key={star}
                onClick={() =>
                  setRating(star)
                }
                className={
                  star <= rating
                    ? "star selected"
                    : "star"
                }
              />

            ))}

          </div>


          <textarea
            placeholder="Write your review..."
            value={comment}
            onChange={(e) =>
              setComment(e.target.value)
            }
          />


          <button type="submit">
            Submit Review
          </button>

        </form>

      </div>


      {/* REVIEWS */}

      <div className="review-list">

        {loading ? (

          <h3>
            Loading reviews...
          </h3>

        ) : reviews.length === 0 ? (

          <h3>
            No reviews yet. Be the first to review!
          </h3>

        ) : (

          reviews.map((review) => (

            <div
              className="review-card"
              key={review._id}
            >

              <div className="review-header">

                <h3>
                  {review.name}
                </h3>

                <div>

                  {[1, 2, 3, 4, 5].map(
                    (star) => (

                      <FaStar
                        key={star}
                        className={
                          star <= review.rating
                            ? "star active"
                            : "star"
                        }
                      />

                    )
                  )}

                </div>

              </div>


              <p className="review-comment">
                {review.comment}
              </p>


              <small>
                {new Date(
                  review.createdAt
                ).toLocaleDateString()}
              </small>


              <button
                className="delete-review"
                onClick={() =>
                  deleteReview(review._id)
                }
              >
                <FaTrash />
                Delete
              </button>

            </div>

          ))

        )}

      </div>

    </div>

  );
};

export default Reviews;