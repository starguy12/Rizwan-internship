import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import AuthorImage from "../../images/author_thumbnail.jpg";
import nftImage from "../../images/nftImage.jpg";

const EXPLORE_URL =
  "https://us-central1-nft-cloud-functions.cloudfunctions.net/explore";

const PAGE_SIZE = 8;

const ExploreItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [filter, setFilter] = useState("");
  const [now, setNow] = useState(Date.now());

  // Fetch explore data
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await fetch(EXPLORE_URL);
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
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Live countdown tick
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

  // Sort by selected filter
  const sortedItems = useMemo(() => {
    const list = [...items];
    switch (filter) {
      case "price_low_to_high":
        return list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
      case "price_high_to_low":
        return list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
      case "likes_high_to_low":
        return list.sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));
      default:
        return list;
    }
  }, [items, filter]);

  const visibleItems = sortedItems.slice(0, visibleCount);
  const hasMore = visibleCount < sortedItems.length;

  const handleLoadMore = (e) => {
    e.preventDefault();
    setVisibleCount((prev) => prev + PAGE_SIZE);
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setVisibleCount(PAGE_SIZE); // reset to first 8 when filter changes
  };

  const renderCard = (item, index) => {
    const id = item?.id ?? item?.nftId ?? index;
    const title = item?.title || "Pinky Ocean";
    const img = item?.nftImage || nftImage;
    const authorImg = item?.authorImage || AuthorImage;
    const price = item?.price != null ? `${item.price} ETH` : "—";
    const likes = item?.likes ?? 0;
    const expiry = formatExpiry(item?.expiryDate);
    const authorId = item?.authorId;
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
                  <a href="" target="_blank" rel="noreferrer">
                    <i className="fa fa-facebook fa-lg"></i>
                  </a>
                  <a href="" target="_blank" rel="noreferrer">
                    <i className="fa fa-twitter fa-lg"></i>
                  </a>
                  <a href="">
                    <i className="fa fa-envelope fa-lg"></i>
                  </a>
                </div>
              </div>
            </div>
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
          <Link
            to=""
            id="loadmore"
            className="btn-main lead"
            onClick={handleLoadMore}
          >
            Load more
          </Link>
        </div>
      )}
    </>
  );
};

export default ExploreItems;
