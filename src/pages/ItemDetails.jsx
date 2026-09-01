import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import EthImage from "../images/ethereum.svg";
import AuthorImage from "../images/author_thumbnail.jpg";
import nftImage from "../images/nftImage.jpg";

const ITEM_DETAILS_URL =
  "https://us-central1-nft-cloud-functions.cloudfunctions.net/itemDetails";

const ItemDetails = () => {
  const { nftId } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!nftId) return;

    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `${ITEM_DETAILS_URL}?nftId=${encodeURIComponent(nftId)}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!mounted) return;
        setItem(data);
      } catch (err) {
        console.warn("ItemDetails:", err);
        if (!mounted) return;
        setError(err.message || "Failed to load item");
        setItem(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [nftId]);

  if (loading) {
    return (
      <div id="wrapper">
        <div className="no-bottom no-top" id="content">
          <div id="top"></div>
          <section aria-label="section" className="mt90 sm-mt-0">
            <div className="container">
              <div className="row">
                <div className="col-md-6 text-center">
                  <div
                    className="skeleton-box"
                    style={{ width: "100%", height: "400px" }}
                  ></div>
                </div>
                <div className="col-md-6">
                  <div className="item_info">
                    <div
                      className="skeleton-box"
                      style={{ width: "70%", height: "40px" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div id="wrapper">
        <div className="no-bottom no-top" id="content">
          <div className="container" style={{ padding: "100px 0" }}>
            <h2>Item not found</h2>
            <p>{error || "This NFT could not be loaded."}</p>
            <Link to="/explore">← Back to Explore</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="wrapper">
      <div className="no-bottom no-top" id="content">
        <div id="top"></div>
        <section aria-label="section" className="mt90 sm-mt-0">
          <div className="container">
            <div className="row">
              {/* Big image */}
              <div className="col-md-6 text-center">
                <img
                  src={item.nftImage || nftImage}
                  className="img-fluid img-rounded mb-sm-30 nft-image"
                  alt={item.title}
                />
              </div>

              <div className="col-md-6">
                <div className="item_info">
                  <h2>{item.title || "Untitled"}</h2>

                  <div className="item_info_counts">
                    <div className="item_info_views">
                      <i className="fa fa-eye"></i>
                      {item.views ?? 100}
                    </div>
                    <div className="item_info_like">
                      <i className="fa fa-heart"></i>
                      {item.likes ?? 0}
                    </div>
                  </div>

                  {/* Static text as requested */}
                  <p>
                    doloremque laudantium, totam rem aperiam, eaque ipsa quae ab
                    illo inventore veritatis et quasi architecto beatae vitae
                    dicta sunt explicabo.
                  </p>

                  <div className="d-flex flex-row">
                    <div className="mr40">
                      <h6>Owner</h6>
                      <div className="item_author">
                        <div className="author_list_pp">
                          <Link to={`/author/${item.ownerId}`}>
                            <img
                              className="lazy"
                              src={item.ownerImage || AuthorImage}
                              alt=""
                            />
                            <i className="fa fa-check"></i>
                          </Link>
                        </div>
                        <div className="author_list_info">
                          <Link to={`/author/${item.ownerId}`}>
                            {item.ownerName || "Unknown"}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="de_tab tab_simple">
                    <div className="de_tab_content">
                      <h6>Creator</h6>
                      <div className="item_author">
                        <div className="author_list_pp">
                          <Link to={`/author/${item.creatorId}`}>
                            <img
                              className="lazy"
                              src={item.creatorImage || AuthorImage}
                              alt=""
                            />
                            <i className="fa fa-check"></i>
                          </Link>
                        </div>
                        <div className="author_list_info">
                          <Link to={`/author/${item.creatorId}`}>
                            {item.creatorName || "Unknown"}
                          </Link>
                        </div>
                      </div>
                    </div>

                    <div className="spacer-40"></div>

                    <h6>Price</h6>
                    <div className="nft-item-price">
                      <img src={EthImage} alt="" />
                      <span>{item.price ?? "—"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ItemDetails;