import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import AuthorImage from "../../images/author_thumbnail.jpg";
import nftImage from "../../images/nftImage.jpg";

const NEW_ITEMS_URL =
  "https://us-central1-nft-cloud-functions.cloudfunctions.net/newItems";

/* ========================= Custom Arrows ========================= */

const NextArrow = ({ onClick }) => (
  <button
    className="slick-arrow slick-next"
    onClick={onClick}
    style={{
      position: "absolute",
      right: "-15px",
      top: "40%",
      zIndex: 10,
      background: "#212529",
      color: "white",
      border: "none",
      borderRadius: "50%",
      width: "40px",
      height: "40px",
      fontSize: "18px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    ›
  </button>
);

const PrevArrow = ({ onClick }) => (
  <button
    className="slick-arrow slick-prev"
    onClick={onClick}
    style={{
      position: "absolute",
      left: "-15px",
      top: "40%",
      zIndex: 10,
      background: "#212529",
      color: "white",
      border: "none",
      borderRadius: "50%",
      width: "40px",
      height: "40px",
      fontSize: "18px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    ‹
  </button>
);

const NewItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(Date.now());

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

  // Live countdown clock
  useEffect(() => {
    const id = setInterval(() => {
      setNow(Date.now());
    }, 1000);
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

  const sliderSettings = {
    dots: true,
    infinite: items.length > 4,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1200,
        settings: { slidesToShow: 3, infinite: items.length > 3 },
      },
      {
        breakpoint: 992,
        settings: { slidesToShow: 2, infinite: items.length > 2 },
      },
      {
        breakpoint: 576,
        settings: { slidesToShow: 1, infinite: items.length > 1 },
      },
    ],
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
      <div key={id}>
        <div className="nft__item" style={{ margin: "0 10px" }}>
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

          <div className="col-lg-12" style={{ position: "relative" }}>
            {loading ? (
              <Slider {...sliderSettings}>
                {new Array(4).fill(0).map((_, index) => (
                  <div key={index}>
                    <div className="nft__item" style={{ margin: "0 10px" }}>
                      <div className="nft__item_wrap">
                        <img
                          src={nftImage}
                          className="lazy nft__item_preview"
                          alt=""
                        />
                      </div>
                      <div className="nft__item_info">
                        <h4>Loading...</h4>
                        <div className="nft__item_price">—</div>
                      </div>
                    </div>
                  </div>
                ))}
              </Slider>
            ) : items.length === 0 ? (
              <p className="text-center">No new items found.</p>
            ) : (
              <Slider key={items.length} {...sliderSettings}>
                {items.map((item, index) => renderCard(item, index))}
              </Slider>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewItems;