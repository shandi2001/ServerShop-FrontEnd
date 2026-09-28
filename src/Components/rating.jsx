import React, { useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import './rating.css';
import reviewService from '../services/reviewService';

const defaultReviews = [
  { name: "Samer Al-Homsi", role: "Senior DevOps Engineer", company: "SyriaTech", comment: "Switching our corporate servers to ServerGo was the best decision. The local ping under 15ms completely transformed our databases speed.", rating: 5 },
  { name: "Maya Mahmoud", role: "E-Commerce Founder", company: "Matjarona", comment: "Unbelievable hosting stability! Our online store handled thousands of active local visitors simultaneously without a single drop.", rating: 5 },
  { name: "Fadi Mansour", role: "Full-Stack Developer", company: "Freelance", comment: "Full root access combined with a super clean, intuitive purple dashboard. Deploying virtual windows templates takes literally seconds.", rating: 5 },
  { name: "Rayan Issa", role: "UI/UX Designer", company: "Creative Agency", comment: "The design consistency and micro-interactions on this platform are top-notch. Truly enterprise-grade hosting for modern apps.", rating: 5 },
  { name: "Hassan Diab", role: "Cybersecurity Analyst", company: "SafeData", comment: "Automated local DDoS peering filtered malicious traffic instantly at the gateway level. Outstanding uptime and security metrics!", rating: 5 }
];

const Testimonials = () => {
  // استخدام الـ Ref للتحكم اليدوي السلس بشريط السحب وإزاحته
  const sliderTrackRef = useRef(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState(defaultReviews);
  const [submitting, setSubmitting] = useState(false);

  const currentUser = (() => {
    try {
      const saved = localStorage.getItem('servergo_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();

  // Map a Backend review document onto the shape this slider renders
  const toCard = (review) => ({
    id: review._id,
    name: review.userId?.name || 'ServerGo Customer',
    role: 'Verified Customer',
    company: 'ServerGo',
    comment: review.comment,
    rating: Number(review.rate) || 0,
  });

  // Real reviews from the Backend; the built-in list is only a fallback
  // so the homepage is never empty before the first customer review.
  const loadReviews = async () => {
    try {
      const response = await reviewService.getAllReviews();

      const docs = Array.isArray(response?.doc) ? response.doc : [];

      if (docs.length > 0) {
        setReviews(docs.map(toCard));
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
    }
  };

  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // دالة الإزاحة لليسار (مشاهدة الكروت التالية)
  const slideLeft = () => {
    if (sliderTrackRef.current) {
      sliderTrackRef.current.scrollLeft += 320; // مقدار الإزاحة بالبكسل (عرض الكرت + الفراغ)
    }
  };

  // دالة الإزاحة لليمين (العودة للخلف)
  const slideRight = () => {
    if (sliderTrackRef.current) {
      sliderTrackRef.current.scrollLeft -= 320;
    }
  };

  const handleOpenReviewModal = () => {
    if (!currentUser) {
      Swal.fire({
        icon: 'warning',
        title: 'Login required',
        text: 'Please sign in to your account before sharing a review.',
        confirmButtonColor: '#7c3aed'
      });
      return;
    }

    setShowReviewModal(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      Swal.fire({
        icon: 'warning',
        title: 'Login required',
        text: 'Please sign in to your account before sharing a review.',
        confirmButtonColor: '#7c3aed'
      });
      return;
    }

    const finalComment =
      comment.trim() || 'Excellent service and reliable hosting experience.';

    try {
      setSubmitting(true);

      await reviewService.createReview(rating, finalComment);

      // Re-read from the Backend so the slider shows the stored review
      await loadReviews();

      setComment('');
      setRating(5);
      setShowReviewModal(false);

      Swal.fire({
        icon: 'success',
        title: 'Thanks for your review!',
        text: 'Your review is now published on ServerGo.',
        confirmButtonColor: '#7c3aed'
      });
    } catch (error) {
      console.error('Failed to submit review:', error?.response?.data || error);

      Swal.fire({
        icon: 'error',
        title: 'Could not publish your review',
        text:
          error?.response?.data?.message ||
          'Something went wrong. Please try again.',
        confirmButtonColor: '#fd0d11'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="servergo-reviews-section" dir="ltr">
      <div className="reviews-container">
        <span className="reviews-badge">CLIENT TRUST</span>
        <h2>Trusted by Syrian Developers & Businesses</h2>
        <p className="reviews-subtitle">
          See how leading regional teams and developers leverage ServerGo infrastructure to deliver high-availability local digital experiences.
        </p>

        {currentUser?.role !== 'ADMIN' && (
          <button className="review-submit-trigger" onClick={handleOpenReviewModal}>
            <i className="fa-solid fa-pen-to-square"></i> Add your review
          </button>
        )}

        {/* حاوية المعرض الشاملة والأسهم */}
        <div className="multi-card-slider-wrapper">
          
          {/* سهم الإزاحة الأيسر للعودة */}
          <button className="slider-action-arrow left-arrow-btn" onClick={slideRight}>
            <i className="fa-solid fa-chevron-left"></i>
          </button>

          {/* نافذة السحب التي تعرض الكروت جنب بعضها وتخفي الباقي */}
          <div className="cards-scroll-window" ref={sliderTrackRef}>
            {reviews.map((user, index) => (
              <div key={user.id || index} className="review-horizontal-card">
                
                <div className="review-stars-row">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className={`fa-${i < user.rating ? 'solid' : 'regular'} fa-star ${i < user.rating ? 'classic-star-filled' : 'classic-star-empty'}`}></i>
                  ))}
                </div>

                <p className="review-comment-text">"{user.comment}"</p>

                <div className="review-user-info">
                  <div className="user-avatar-placeholder">{user.name.charAt(0)}</div>
                  <div className="user-meta-details">
                    <h4>{user.name}</h4>
                    <p>{user.role} <span>@ {user.company}</span></p>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* سهم الإزاحة الأيمن للتقدم */}
          <button className="slider-action-arrow right-arrow-btn" onClick={slideLeft}>
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>

      </div>

      {showReviewModal && (
        <div className="review-modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="review-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="review-modal-header">
              <h3>Add your review</h3>
              <button type="button" className="review-modal-close" onClick={() => setShowReviewModal(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="review-modal-form">
              <label className="review-form-label">Your rating</label>
              <div className="review-rating-picker">
                {[...Array(5)].map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`review-star-button ${index < rating ? 'active' : ''}`}
                    onClick={() => setRating(index + 1)}
                  >
                    <i className={`fa-${index < rating ? 'solid' : 'regular'} fa-star`}></i>
                  </button>
                ))}
              </div>

              <label className="review-form-label">Comment (optional)</label>
              <textarea
                rows="4"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with ServerGo..."
              />

              <button type="submit" className="review-submit-btn" disabled={submitting}>
                {submitting ? 'Publishing...' : 'Publish review'}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default Testimonials;
