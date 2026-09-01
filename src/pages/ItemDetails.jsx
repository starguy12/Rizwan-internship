import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import EthImage from "../images/ethereum.svg";
import AuthorImage from "../images/author_thumbnail.jpg";
import nftImage from "../images/nftImage.jpg";

const ITEM_DETAILS_URL =
  "https://us-central1-nft-cloud-functions.cloudfunctions.net/itemDetails";

const ItemDetails = () => {
  const params = useParams();
  const nftId = params.nftId;

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!nftId) {
      setLoading(false);
      setError("No NFT ID provided");
      return;
    }

    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `${ITEM_DETAILS_URL}?nftId=${encodeURIComponent(nftId)}`
        );

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();

        if (mounted) {
          setItem(data);
        }
      } catch (err) {
        console.error("ItemDetails error:", err);
        if (mounted) {
          setError(err.message || "Failed to load item");
          setItem(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [nftId]);

  // ---------- Loading state ----------
  if (loading) {
    return (
      <div id="wrapper">
        <div className="no-bottom no-top" id="content">
          <section className="mt90 sm-mt-0">
            <div className="container">
              <div className="row">
                <div className="col-md-6 text-center">
                  <div
                    style={{
                      width: "100%",
                      height: "400px",
                      background: "#eee",
                      borderRadius: "8px",
                    }}
                  />
                </div>
                <div className="col-md-6">
                  <div
                    style={{
                      width: "70%",
                      height: "32px",
                      background: "#eee",
                      marginBottom: "16px",
                    }}
                  />
                  <div
                    style={{
                      width: "100%",
                      height: "80px",
                      background: "#eee",
                    }}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // ---------- Error state ----------
  if (error || !item) {
    return (
      <div id="wrapper">
        <div className="no-bottom no-top" id="content">
          <div className="container" style={{ padding: "80px 0" }}>
            <h2>Item not found</h2>
            <p>{error || "This NFT could not be loaded."}</p>
            <p>
              <Link to="/explore">← Back to Explore</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Success state ----------
  return (
    <div id="wrapper">
      <div className="no-bottom no-top" id="content">
        <div id="top"></div>
        <section aria-label="section" className="mt90 sm-mt-0">
          <div className="container">
            <div className="row">
              {/* Large image */}
              <div className="col-md-6 text-center">
                <img
                  src={item.nftImage || nftImage}
                  className="img-fluid img-rounded mb-sm-30 nft-image"
                  alt={item.title || "NFT"}
                  style={{ maxWidth: "100%" }}
                />
              </div>

              <div className="col-md-6">
                <div className="item_info">
                  <h2>{item.title || "Untitled"}</h2>

                  <div className="item_info_counts">
                    <div className="item_info_views">
                      <i className="fa fa-eye"></i> {item.views ?? 100}
                    </div>
                    <div className="item_info_like">
                      <i className="fa fa-heart"></i> {item.likes ?? 0}
                    </div>
                  </div>

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
                          <Link to={`/author/${item.ownerId || ""}`}>
                            <img
                              className="lazy"
                              src={item.ownerImage || AuthorImage}
                              alt=""
                            />
                            <i className="fa fa-check"></i>
                          </Link>
                        </div>
                        <div className="author_list_info">
                          <Link to={`/author/${item.ownerId || ""}`}>
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
                          <Link to={`/author/${item.creatorId || ""}`}>
                            <img
                              className="lazy"
                              src={item.creatorImage || AuthorImage}
                              alt=""
                            />
                            <i className="fa fa-check"></i>
                          </Link>
                        </div>
                        <div className="author_list_info">
                          <Link to={`/author/${item.creatorId || ""}`}>
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