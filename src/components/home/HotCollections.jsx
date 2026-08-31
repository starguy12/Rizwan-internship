import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AuthorImage from "../../images/author_thumbnail.jpg";
import nftImage from "../../images/nftImage.jpg";

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

/** Map /newItems payload into the shape HotCollections expects */
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

const HotCollections = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [source, setSource] = useState(null); // 'api' | 'newItems' | 'mock'

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      // 1) Primary: /hotcollections
      try {
        console.log("HotCollections: fetching", HOT_COLLECTIONS_URL);
        const res = await fetch(HOT_COLLECTIONS_URL);
        console.log("HotCollections: response", res.status);

        if (res.ok) {
          const data = await res.json();
          if (!mounted) return;
          setItems(Array.isArray(data) ? data : []);
          setSource("api");
          setError(null);
          return;
        }
        // Non-OK → fall through to next source
        console.warn("HotCollections: hotcollections failed with", res.status);
      } catch (err) {
        console.warn("HotCollections: hotcollections error", err);
      }

      // 2) Temporary fallback: /newItems
      try {
        console.log("HotCollections: trying fallback", NEW_ITEMS_URL);
        const res = await fetch(NEW_ITEMS_URL);

        if (res.ok) {
          const data = await res.json();
          if (!mounted) return;
          setItems(mapNewItemsToCollections(data));
          setSource("newItems");
          setError("hotcollections unavailable — using /newItems as temporary source");
          return;
        }
        console.warn("HotCollections: newItems failed with", res.status);
      } catch (err) {
        console.warn("HotCollections: newItems error", err);
      }

      // 3) Last resort: local mock
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

  const pick = (obj, ...keys) => {
    for (const k of keys) if (obj && obj[k]) return obj[k];
    return null;
  };

  const sourceLabel =
    source === "api"
      ? "fetched from API (/hotcollections)"
      : source === "newItems"
        ? "temporary: /newItems"
        : source === "mock"
          ? "using local mock"
          : null;

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

          {loading ? (
            new Array(4).fill(0).map((_, index) => (
              <div className="col-lg-3 col-md-6 col-sm-6 col-xs-12" key={index}>
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
            ))
          ) : (
            <>
              {error && (
                <div className="col-12" style={{ marginBottom: 12 }}>
                  Warning: {error}
                </div>
              )}
              {items.slice(0, 4).map((item, index) => {
                const img =
                  pick(item, "img", "image", "nftImage", "banner") || nftImage;
                const authorImg =
                  pick(item, "authorImg", "author_image", "authorImage") ||
                  AuthorImage;
                const title =
                  pick(item, "name", "title", "collection") ||
                  `Collection ${index + 1}`;
                const code =
                  pick(item, "code", "symbol", "token") || "ERC-192";
                const id = pick(item, "id", "tokenId", "_id") || index;

                return (
                  <div
                    className="col-lg-3 col-md-6 col-sm-6 col-xs-12"
                    key={id}
                  >
                    <div className="nft_coll">
                      <div className="nft_wrap">
                        <Link to="/item-details">
                          <img
                            src={img}
                            className="lazy img-fluid"
                            alt={title}
                          />
                        </Link>
                      </div>
                      <div className="nft_coll_pp">
                        <Link to="/author">
                          <img
                            className="lazy pp-coll"
                            src={authorImg}
                            alt={title}
                          />
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
              })}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default HotCollections;