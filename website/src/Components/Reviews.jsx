import React, { useState, useEffect } from "react";
import { FaStar, FaTrash, FaArrowLeft } from "react-icons/fa";
import "./Reviews.css";
import { useParams, useLocation, useNavigate } from "react-router-dom";

const Reviews = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const product = location.state?.product;
  const { productId } = useParams();

  const [reviews, setReviews] = useState([]);

  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  // Loading reviews
  const [loading, setLoading] = useState(true);

  // Loading submit review
  const [submitLoading, setSubmitLoading] = useState(false);

  // ========================================
  // GET REVIEWS
  // ========================================

  const getReviews = async () => {
    try {
      const response = await fetch(
        `https://davira-backend.onrender.com/reviews/${productId}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch reviews"
        );
      }

      setReviews(data);
    } catch (error) {
      console.error(
        "Error fetching reviews:",
        error
      );
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

    // Prevent multiple submissions
    if (submitLoading) return;

    if (!name.trim() || !comment.trim()) {
      alert("Please fill in all fields");
      return;
    }

    // Start spinner
    setSubmitLoading(true);

    try {
      const response = await fetch(
        "https://davira-backend.onrender.com/reviews",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            productId: productId,
            productName: product?.name || "Product",
            name: name,
            rating: rating,
            comment: comment,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to submit review"
        );
      }

      // Add new review to screen
      setReviews((previousReviews) => [
        data.review,
        ...previousReviews,
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

      alert(
        error.message ||
          "Failed to submit review"
      );
    } finally {
      // Stop spinner
      setSubmitLoading(false);
    }
  };

  // ========================================
  // DELETE REVIEW
  // ========================================

  const deleteReview = async (id) => {
    try {
      const response = await fetch(
        `https://davira-backend.onrender.com/reviews/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete review"
        );
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

      alert(
        error.message ||
          "Failed to delete review"
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

  // ========================================
  // RETURN
  // ========================================

  return (
    <div className="reviews-section">

      {/* BACK HOME */}

      <button
        className="lod"
        onClick={() => navigate("/")}
      >
        <FaArrowLeft className="arr" />
        Back Home
      </button>

      <h2>
        Customer Reviews
      </h2>

      {/* ========================================
          AVERAGE RATING
      ======================================== */}

      <div className="average-rating">

        <h3>
          {averageRating}
        </h3>

        <div className="stars">

          {[1, 2, 3, 4, 5].map(
            (star) => (
              <FaStar
                key={star}
                className={
                  star <=
                  Math.round(
                    Number(averageRating)
                  )
                    ? "star active"
                    : "star"
                }
              />
            )
          )}

        </div>

        <p>
          {reviews.length} review
          {reviews.length !== 1
            ? "s"
            : ""}
        </p>

      </div>

      {/* ========================================
          REVIEW FORM
      ======================================== */}

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
            disabled={submitLoading}
          />

          {/* RATING */}

          <div className="rating-input">

            <p>
              Your rating:
            </p>

            {[1, 2, 3, 4, 5].map(
              (star) => (
                <FaStar
                  key={star}
                  onClick={() =>
                    !submitLoading &&
                    setRating(star)
                  }
                  className={
                    star <= rating
                      ? "star selected"
                      : "star"
                  }
                />
              )
            )}

          </div>

          {/* COMMENT */}

          <textarea
            placeholder="Write your review..."
            value={comment}
            onChange={(e) =>
              setComment(e.target.value)
            }
            disabled={submitLoading}
          />

          {/* SUBMIT BUTTON */}

          <button
            type="submit"
            className="submit-review-btn"
            disabled={submitLoading}
          >
            {submitLoading ? (
              <>
                <span className="review-submit-spinner"></span>
                Submitting...
              </>
            ) : (
              "Submit Review"
            )}
          </button>

        </form>

      </div>

      {/* ========================================
          REVIEWS
      ======================================== */}

      <div className="review-list">

        {loading ? (

          <h3>
            Loading reviews...
          </h3>

        ) : reviews.length === 0 ? (

          <h3>
            No reviews yet. Be the first
            to review!
          </h3>

        ) : (

          reviews.map((review) => (

            <div
              className="review-card"
              key={review._id}
            >

              {/* REVIEW HEADER */}

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
                          star <=
                          review.rating
                            ? "star active"
                            : "star"
                        }
                      />
                    )
                  )}

                </div>

              </div>

              {/* COMMENT */}

              <p className="review-comment">
                {review.comment}
              </p>

              {/* DATE */}

              <small>
                {new Date(
                  review.createdAt
                ).toLocaleDateString()}
              </small>

              {/* DELETE */}

              <button
                className="delete-review"
                onClick={() =>
                  deleteReview(
                    review._id
                  )
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