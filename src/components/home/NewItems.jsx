import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AuthorImage from "../../images/author_thumbnail.jpg";
import nftImage from "../../images/nftImage.jpg";

const NEW_ITEMS_URL =
  "https://us-central1-nft-cloud-functions.cloudfunctions.net/newItems";  //Added this line to fetch new items from the API

const NewItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // ticks every second so countdown stays live
  const [now, setNow] = useState(Date.now());   // Added this line to keep track of the current time for countdowns

  // Fetch new items
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const res = await fetch(NEW_ITEMS_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!mounted) return;
        setItems(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.warn("NewItems: error", err);
        if (!mounted) return;
        setItems([]);
        setError(err.message || "Failed to load new items");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  // Live clock — re-render every 1s
  useEffect(() => {
    const id = setInterval(() => {
      setNow(Date.now());  //updates the current time every second to keep the countdowns accurate
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const formatExpiry = (ts) => {          //recalculates the remaining time until the expiry date and formats it as a string
    if (ts == null || ts === "") return "—";
    const end = Number(ts);
    if (Number.isNaN(end)) return "—";

    const diff = end - now;
    if (diff <= 0) return "Expired";

    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${h}h ${m}m ${s}s`;
  };

  const renderCard = (item, index) => {
    const id = item?.id ?? item?.nftId ?? index;
    const title = item?.title || "Pinky Ocean";
    const img = item?.nftImage || nftImage;
    const authorImg = item?.authorImage || AuthorImage;
    const price = item?.price != null ? `${item.price} ETH` : "—";
    const likes = item?.likes ?? 0;
    const expiry = formatExpiry(item?.expiryDate);  //formats the expiry date for display in the countdown
    const authorId = item?.authorId;
    const nftId = item?.nftId ?? id;

    return (
      <div className="col-lg-3 col-md-6 col-sm-6 col-xs-12" key={id}>
        <div className="nft__item">
          <div className="author_list_pp">
            <Link
              to={authorId ? `/author/${authorId}` : "/author"}
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              title="Creator"
            >
              <img className="lazy" src={authorImg} alt="" />
              <i className="fa fa-check"></i>
            </Link>
          </div>

          {/* Live countdown */}
          <div className="de_countdown">{expiry}</div>

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
    <section id="section-items" className="no-bottom">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="text-center">
              <h2>New Items</h2>
              <div className="small-border bg-color-2"></div>
            </div>
          </div>

          {error && (
            <div className="col-12" style={{ marginBottom: 12 }}>
              Warning: {error}
            </div>
          )}

          {loading
            ? new Array(4).fill(0).map((_, index) => renderCard(null, index))
            : items.length === 0
              ? (
                <div className="col-12 text-center">
                  <p>No new items found.</p>
                </div>
              )
              : items.map((item, index) => renderCard(item, index))}
        </div>
      </div>
    </section>
  );
};

export default NewItems;