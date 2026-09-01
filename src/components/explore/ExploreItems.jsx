import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AuthorImage from "../../images/author_thumbnail.jpg";
import nftImage from "../../images/nftImage.jpg";

const EXPLORE_BASE_URL =
  "https://us-central1-nft-cloud-functions.cloudfunctions.net/explore";

const AUTHOR_URL =
  "https://us-central1-nft-cloud-functions.cloudfunctions.net/authors?author=73855012";

const PAGE_SIZE = 8;

const ExploreItems = () => {
  const [items, setItems] = useState([]);
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [filter, setFilter] = useState("");
  const [now, setNow] = useState(Date.now());

  // 1. Fetch author data (once)
  useEffect(() => {
    let mounted = true;

    const loadAuthor = async () => {
      try {
        const res = await fetch(AUTHOR_URL);
        if (!res.ok) throw new Error(`Author HTTP ${res.status}`);
        const data = await res.json();
        if (mounted) setAuthor(data);
      } catch (err) {
        console.warn("Author fetch failed:", err);
      }
    };

    loadAuthor();
    return () => {
      mounted = false;
    };
  }, []);

  // 2. Fetch explore data (with optional filter)
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setVisibleCount(PAGE_SIZE);

      try {
        const url = filter
          ? `${EXPLORE_BASE_URL}?filter=${encodeURIComponent(filter)}`
          : EXPLORE_BASE_URL;

        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!mounted) return;
        setItems(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.warn("ExploreItems:", err);
        if (!mounted) return;
        setItems([]);
        setError(err.message || "Failed to load explore items");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [filter]);

  // Live countdown
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const formatExpiry = (ts) => {
    if (ts == null || ts === "") return null;
    const end = Number(ts);
    if (Number.isNaN(end)) return null;
    const diff = end - now;
    if (diff <= 0) return "Expired";
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${h}h ${m}m ${s}s`;
  };

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  const handleLoadMore = (e) => {
    e.preventDefault();
    setVisibleCount((prev) => prev + PAGE_SIZE);
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const renderCard = (item, index) => {
    const id = item?.id ?? item?.nftId ?? index;
    const title = item?.title || "Pinky Ocean";
    const img = item?.nftImage || nftImage;

    // Prefer item's own author image → fetched author → static fallback
    const authorImg =
      item?.authorImage || author?.authorImage || AuthorImage;

    const price = item?.price != null ? `${item.price} ETH` : "—";
    const likes = item?.likes ?? 0;
    const expiry = formatExpiry(item?.expiryDate);
    const authorId = item?.authorId ?? author?.authorId ?? author?.id;
    const nftId = item?.nftId ?? id;

    return (
      <div
        key={id}
        className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12"
        style={{ display: "block", backgroundSize: "cover" }}
      >
        <div className="nft__item">
          <div className="author_list_pp">
            <Link
              to={authorId ? `/author/${authorId}` : "/author"}
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              title={author?.authorName}
            >
              <img className="lazy" src={authorImg} alt="" />
              <i className="fa fa-check"></i>
            </Link>
          </div>

          {expiry && <div className="de_countdown">{expiry}</div>}

          <div className="nft__item_wrap">
            <div className="nft__item_extra">
              <div className="nft__item_buttons">
                <button>Buy Now</button>
                <div className="nft__item_share">
                  <h4>Share</h4>
                  <a
                    href="https://www.facebook.com/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <i className="fa fa-facebook fa-lg"></i>
                  </a>
                  <a
                    href="https://twitter.com/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <i className="fa fa-twitter fa-lg"></i>
                  </a>
                  <a href="mailto:">
                    <i className="fa fa-envelope fa-lg"></i>
                  </a>
                </div>
              </div>
            </div>

            {/* Click → full item page */}
            <Link to={`/item-details/${nftId}`}>
              <img
                src={img}
                className="lazy nft__item_preview"
                alt={title}
              />
            </Link>
          </div>

          <div className="nft__item_info">
            <Link to={`/item-details/${nftId}`}>
              <h4>{title}</h4>
            </Link>
            <div className="nft__item_price">{price}</div>
            <div className="nft__item_like">
              <i className="fa fa-heart"></i>
              <span>{likes}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div>
        <select
          id="filter-items"
          value={filter}
          onChange={handleFilterChange}
        >
          <option value="">Default</option>
          <option value="price_low_to_high">Price, Low to High</option>
          <option value="price_high_to_low">Price, High to Low</option>
          <option value="likes_high_to_low">Most liked</option>
        </select>
      </div>

      {error && (
        <div className="col-12" style={{ marginBottom: 12 }}>
          Warning: {error}
        </div>
      )}

      {loading
        ? new Array(PAGE_SIZE).fill(0).map((_, index) =>
            renderCard(null, index)
          )
        : visibleItems.map((item, index) => renderCard(item, index))}

      {hasMore && !loading && (
        <div className="col-md-12 text-center">
          <button
            id="loadmore"
            className="btn-main lead"
            onClick={handleLoadMore}
          >
            Load more
          </button>
        </div>
      )}
    </>
  );
};

export default ExploreItems;