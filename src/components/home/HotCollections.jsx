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
  "https://us-central1-nft-cloud-functions.cloudfunctions.net/hotcollections";
const NEW_ITEMS_URL =
  "https://us-central1-nft-cloud-functions.cloudfunctions.net/newItems";

const MOCK_ITEMS = [
  { id: "m1", name: "Pinky Ocean", img: nftImage, authorImg: AuthorImage, code: "ERC-192" },
  { id: "m2", name: "Sunny Mountains", img: nftImage, authorImg: AuthorImage, code: "ERC-721" },
  { id: "m3", name: "Neon Galaxy", img: nftImage, authorImg: AuthorImage, code: "ERC-1155" },
  { id: "m4", name: "Crypto Waves", img: nftImage, authorImg: AuthorImage, code: "ERC-20" },
];

function mapNewItemsToCollections(items) {
  if (!Array.isArray(items)) return [];
  return items.map((item, index) => ({
    id: item.id ?? item.nftId ?? index,
    name: item.title ?? item.name ?? `Collection ${index + 1}`,
    img: item.nftImage ?? item.image ?? item.img ?? nftImage,
    authorImg: item.authorImage ?? item.authorImg ?? AuthorImage,
    code: item.code ?? item.symbol ?? "ERC-721",
  }));
}

const pick = (obj, ...keys) => {
  for (const k of keys) if (obj && obj[k]) return obj[k];
  return null;
};

const sliderSettings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 4,
  slidesToScroll: 1,
  arrows: true,
  responsive: [
    { breakpoint: 1200, settings: { slidesToShow: 3 } },
    { breakpoint: 992, settings: { slidesToShow: 2 } },
    { breakpoint: 576, settings: { slidesToShow: 1 } },
  ],
};

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

  const sourceLabel =
    source === "api"
      ? "fetched from API (/hotcollections)"
      : source === "newItems"
        ? "temporary: /newItems"
        : source === "mock"
          ? "using local mock"
          : null;

  const renderCard = (item, index) => {
    const img = pick(item, "img", "image", "nftImage", "banner") || nftImage;
    const authorImg =
      pick(item, "authorImg", "author_image", "authorImage") || AuthorImage;
    const title =
      pick(item, "name", "title", "collection") || `Collection ${index + 1}`;
    const code = pick(item, "code", "symbol", "token") || "ERC-192";
    const id = pick(item, "id", "tokenId", "_id") || index;

    return (
      <div key={id} style={{ padding: "0 8px" }}>
        <div className="nft_coll">
          <div className="nft_wrap">
            <Link to="/item-details">
              <img src={img} className="lazy img-fluid" alt={title} />
            </Link>
          </div>
          <div className="nft_coll_pp">
            <Link to="/author">
              <img className="lazy pp-coll" src={authorImg} alt={title} />
            </Link>
            <i className="fa fa-check"></i>
          </div>
          <div className="nft_coll_info">
            <Link to="/explore">
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
              {sourceLabel && (
                <div style={{ fontSize: 12, marginTop: 6 }}>
                  <strong>Data:</strong> {sourceLabel}
                </div>
              )}
              <div className="small-border bg-color-2"></div>
            </div>
          </div>

          {error && (
            <div className="col-12" style={{ marginBottom: 12 }}>
              Warning: {error}
            </div>
          )}

          <div className="col-lg-12">
            {loading ? (
              <Slider {...sliderSettings}>
                {new Array(4).fill(0).map((_, index) => (
                  <div key={index} style={{ padding: "0 8px" }}>
                    <div className="nft_coll">
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
            ) : (
              <Slider {...sliderSettings}>
                {items.map((item, index) => renderCard(item, index))}
              </Slider>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ========================= New Items (dedicated API) ========================= */

const NewItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const formatExpiry = (ts) => {
    if (!ts) return null;
    const diff = ts - Date.now();
    if (diff <= 0) return "Expired";
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${h}h ${m}m ${s}s`;
  };

  const renderCard = (item, index) => {
    const id = item.id ?? item.nftId ?? index;
    const title = item.title || `Item ${index + 1}`;
    const img = item.nftImage || nftImage;
    const authorImg = item.authorImage || AuthorImage;
    const price = item.price != null ? `${item.price} ETH` : "—";
    const likes = item.likes ?? 0;
    const expiry = formatExpiry(item.expiryDate);

    return (
      <div key={id} style={{ padding: "0 8px" }}>
        <div className="nft__item">
          <div className="author_list_pp">
            <Link to={`/author/${item.authorId || ""}`}>
              <img className="lazy" src={authorImg} alt="" />
              <i className="fa fa-check"></i>
            </Link>
          </div>

          {expiry && <div className="de_countdown">{expiry}</div>}

          <div className="nft__item_wrap">
            <Link to={`/item-details/${item.nftId || id}`}>
              <img src={img} className="lazy nft__item_preview" alt={title} />
            </Link>
          </div>

          <div className="nft__item_info">
            <Link to={`/item-details/${item.nftId || id}`}>
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

          <div className="col-lg-12">
            {loading ? (
              <Slider {...sliderSettings}>
                {new Array(4).fill(0).map((_, index) => (
                  <div key={index} style={{ padding: "0 8px" }}>
                    <div className="nft__item">
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
              <Slider {...sliderSettings}>
                {items.map((item, index) => renderCard(item, index))}
              </Slider>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};


export { HotCollections, NewItems };
export default HotCollections;
