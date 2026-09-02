import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AuthorImage from "../../images/author_thumbnail.jpg";
import nftImage from "../../images/nftImage.jpg";

const AUTHOR_URL =
  "https://us-central1-nft-cloud-functions.cloudfunctions.net/authors?author=73855012";

const AuthorItems = () => {
  const [items, setItems] = useState([]);
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(AUTHOR_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (!mounted) return;

        const collection = Array.isArray(data?.nftCollection)
          ? data.nftCollection
          : [];

        setItems(collection);
        setAuthor(data);
        setError(null);
      } catch (err) {
        console.warn("AuthorItems:", err);
        if (!mounted) return;
        setItems([]);
        setAuthor(null);
        setError(err.message || "Failed to load author items");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const renderCard = (item, index) => {
    const id = item?.id ?? item?.nftId ?? index;
    const title = item?.title || "Untitled";
    const img = item?.nftImage || nftImage;
    const authorImg = author?.authorImage || AuthorImage;
    const price = item?.price != null ? `${item.price} ETH` : "—";
    const likes = item?.likes ?? 0;
    const authorId = author?.authorId ?? author?.id;
    const nftId = item?.nftId ?? id;

    return (
      <div className="col-lg-3 col-md-6 col-sm-6 col-xs-12" key={id}>
        <div className="nft__item">
          <div className="author_list_pp">
            <Link to={authorId ? `/author/${authorId}` : "/author"}>
              <img className="lazy" src={authorImg} alt="" />
              <i className="fa fa-check"></i>
            </Link>
          </div>

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

  if (error) {
    return (
      <div className="de_tab_content">
        <div className="tab-1">
          <div className="row">
            <div className="col-12">Warning: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="de_tab_content">
      <div className="tab-1">
        <div className="row">
          {loading
            ? new Array(8).fill(0).map((_, index) => renderCard(null, index))
            : items.map((item, index) => renderCard(item, index))}
        </div>
      </div>
    </div>
  );
};

export default AuthorItems;