import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import AuthorImage from "../../images/author_thumbnail.jpg";
import nftImage from "../../images/nftImage.jpg";

// It seems the Hot_Collections API goes down often, so I had to try fallback to /newItems and then a local mock.
// It seemed to have worked.

const HOT_COLLECTIONS_URL =
  "https://us-central1-nft-cloud-functions.cloudfunctions.net/hotCollections";
const NEW_ITEMS_URL =
  "https://us-central1-nft-cloud-functions.cloudfunctions.net/newItems";

const MOCK_ITEMS = [
  { id: "m1", name: "Pinky Ocean", img: nftImage, authorImg: AuthorImage, code: "ERC-192" },
  { id: "m2", name: "Sunny Mountains", img: nftImage, authorImg: AuthorImage, code: "ERC-721" },
  { id: "m3", name: "Neon Galaxy", img: nftImage, authorImg: AuthorImage, code: "ERC-1155" },
  { id: "m4", name: "Crypto Waves", img: nftImage, authorImg: AuthorImage, code: "ERC-20" },
  { id: "m5", name: "Digital Dreams", img: nftImage, authorImg: AuthorImage, code: "ERC-721" },
  { id: "m6", name: "Pixel World", img: nftImage, authorImg: AuthorImage, code: "ERC-1155" },
];

function mapNewItemsToCollections(items) {
  if (!Array.isArray(items)) return [];
  return items.map((item, index) => ({
    id: item.id ?? item.nftId ?? index,
    name: item.title ?? item.name ?? `Collection ${index + 1}`,
    img: item.nftImage ?? item.image ?? item.img ?? nftImage,
    authorImg: item.authorImage ?? item.authorImg ?? AuthorImage,
    code: item.code ?? item.symbol ?? "ERC-721",
    nftId: item.nftId ?? item.id,
    authorId: item.authorId,
  }));
}

const pick = (obj, ...keys) => {
  for (const k of keys) if (obj && obj[k]) return obj[k];
  return null;
};

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

/* ========================= Hot Collections ========================= */

const HotCollections = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [source, setSource] = useState(null); // 'api' | 'newItems' | 'mock'

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      // 1) Primary: /hotcollections
      // ---> This API seems to go down often, so we have to fallback to /newItems and then a local mock.
      try {
        const res = await fetch(HOT_COLLECTIONS_URL);
        if (res.ok) {
          const data = await res.json();
          if (!mounted) return;
          setItems(Array.isArray(data) ? data : []);
          setSource("api");
          setError(null);
          return;
        }
      } catch (err) {
        console.warn("HotCollections: hotcollections error", err);
      }

      // 2) Temporary fallback: /newItems
      // This API seems to be more stable, but it's not the intended source for hot collections.
      try {
        const res = await fetch(NEW_ITEMS_URL);
        if (res.ok) {
          const data = await res.json();
          if (!mounted) return;
          setItems(mapNewItemsToCollections(data));
          setSource("newItems");
          setError("hotcollections unavailable — using /newItems as temporary source");
          return;
        }
      } catch (err) {
        console.warn("HotCollections: newItems error", err);
      }

      // 3) Local mock
      // This is the last resort if both APIs fail. Initially I didn't consider both APIs to fail.
      if (!mounted) return;
      setItems(MOCK_ITEMS);
      setSource("mock");
      setError("API unavailable — showing local mock data");
    };

    load().finally(() => {
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

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
    const img = pick(item, "img", "image", "nftImage", "banner") || nftImage;
    const authorImg =
      pick(item, "authorImg", "author_image", "authorImage") || AuthorImage;
    const title =
      pick(item, "name", "title", "collection") || `Collection ${index + 1}`;
    const code = pick(item, "code", "symbol", "token") || "ERC-192";
    const id = pick(item, "id", "tokenId", "_id") || index;
    const nftId = item.nftId || item.id || id;
    const authorId = item.authorId;

    return (
      <div key={id}>
        <div className="nft_coll" style={{ margin: "0 10px" }}>
          <div className="nft_wrap">
            {/* Clicking the image now opens the full Item Details page */}
            <Link to={`/item-details/${nftId}`}>
              <img src={img} className="lazy img-fluid" alt={title} />
            </Link>
          </div>
          <div className="nft_coll_pp">
            <Link to={authorId ? `/author/${authorId}` : "/author"}>
              <img className="lazy pp-coll" src={authorImg} alt={title} />
            </Link>
            <i className="fa fa-check"></i>
          </div>
          <div className="nft_coll_info">
            <Link to={`/item-details/${nftId}`}>
              <h4>{title}</h4>
            </Link>
            <span>{code}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section id="section-collections" className="no-bottom">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="text-center">
              <h2>Hot Collections</h2>
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
                {new Array(6).fill(0).map((_, index) => (
                  <div key={index}>
                    <div className="nft_coll" style={{ margin: "0 10px" }}>
                      <div className="nft_wrap">
                        <img src={nftImage} className="lazy img-fluid" alt="" />
                      </div>
                      <div className="nft_coll_pp">
                        <img className="lazy pp-coll" src={AuthorImage} alt="" />
                        <i className="fa fa-check"></i>
                      </div>
                      <div className="nft_coll_info">
                        <h4>Loading...</h4>
                        <span>—</span>
                      </div>
                    </div>
                  </div>
                ))}
              </Slider>
            ) : items.length === 0 ? (
              <p className="text-center">No collections found.</p>
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

export default HotCollections;