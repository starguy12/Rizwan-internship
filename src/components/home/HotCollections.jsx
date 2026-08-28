import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AuthorImage from "../../images/author_thumbnail.jpg";
import nftImage from "../../images/nftImage.jpg";

const HotCollections = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const url = "https://us-central1-nft-cloud-functions.cloudfunctions.net/hotcollections";
    (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (mounted) setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const pick = (obj, ...keys) => {
    for (const k of keys) if (obj && obj[k]) return obj[k];
    return null;
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
          ) : error ? (
            <div className="col-12">Error: {error}</div>
          ) : (
            (items.slice(0, 4)).map((item, index) => {
              const img = pick(item, "img", "image", "nftImage", "banner") || nftImage;
              const authorImg = pick(item, "authorImg", "author_image", "authorImage") || AuthorImage;
              const title = pick(item, "name", "title", "collection") || `Collection ${index + 1}`;
              const code = pick(item, "code", "symbol", "token") || "ERC-192";
              const id = pick(item, "id", "tokenId", "_id") || index;
              return (
                <div className="col-lg-3 col-md-6 col-sm-6 col-xs-12" key={id}>
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
            })
          )}
        </div>
      </div>
    </section>
  );
};

export default HotCollections;
