import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AuthorImage from "../../images/author_thumbnail.jpg";

const TOP_SELLERS_URL =
  "https://us-central1-nft-cloud-functions.cloudfunctions.net/topSellers";

const TopSellers = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const res = await fetch(TOP_SELLERS_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!mounted) return;
        setSellers(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.warn("TopSellers: error", err);
        if (!mounted) return;
        setSellers([]);
        setError(err.message || "Failed to load top sellers");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const renderSeller = (seller, index) => {
    const id = seller?.id ?? seller?.authorId ?? index;
    const name = seller?.authorName || "Monica Lucas";
    const img = seller?.authorImage || AuthorImage;
    const authorId = seller?.authorId;
    const price =
      seller?.price != null ? `${seller.price} ETH` : "—";

    return (
      <li key={id}>
        <div className="author_list_pp">
          <Link to={authorId ? `/author/${authorId}` : "/author"}>
            <img className="lazy pp-author" src={img} alt={name} />
            <i className="fa fa-check"></i>
          </Link>
        </div>
        <div className="author_list_info">
          <Link to={authorId ? `/author/${authorId}` : "/author"}>
            {name}
          </Link>
          <span>{price}</span>
        </div>
      </li>
    );
  };

  return (
    <section id="section-popular" className="pb-5">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="text-center">
              <h2>Top Sellers</h2>
              <div className="small-border bg-color-2"></div>
            </div>
          </div>

          {error && (
            <div className="col-12" style={{ marginBottom: 12 }}>
              Warning: {error}
            </div>
          )}

          <div className="col-md-12">
            <ol className="author_list">
              {loading
                ? new Array(12).fill(0).map((_, index) =>
                    renderSeller(null, index)
                  )
                : sellers.length === 0
                  ? (
                    <li>
                      <div className="author_list_info">
                        <span>No top sellers found.</span>
                      </div>
                    </li>
                  )
                  : sellers.map((seller, index) =>
                      renderSeller(seller, index)
                    )}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TopSellers;