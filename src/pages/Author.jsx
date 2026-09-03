import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import AuthorBanner from "../images/author_banner.jpg";
import AuthorItems from "../components/author/AuthorItems";
import AuthorImage from "../images/author_thumbnail.jpg";

const Author = () => {
  const { authorId } = useParams();
  const [author, setAuthor] = useState(null);
  const [followers, setFollowers] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        // Use the authorId from the URL, fallback to the hardcoded one
        const id = authorId || "73855012";
        const res = await fetch(
          `https://us-central1-nft-cloud-functions.cloudfunctions.net/authors?author=${id}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (!mounted) return;

        setAuthor(data);
        setFollowers(data.followers || 573);
      } catch (err) {
        console.warn("Author page error:", err);
        if (!mounted) return;
        setAuthor(null);
        setFollowers(573);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [authorId]);

  const handleFollow = () => {
    if (isFollowing) {
      setFollowers((prev) => prev - 1);
      setIsFollowing(false);
    } else {
      setFollowers((prev) => prev + 1);
      setIsFollowing(true);
    }
  };

  return (
    <div id="wrapper">
      <div className="no-bottom no-top" id="content">
        <div id="top"></div>

        <section
          id="profile_banner"
          aria-label="section"
          className="text-light"
          data-bgimage="url(images/author_banner.jpg) top"
          style={{ background: `url(${AuthorBanner}) top` }}
        ></section>

        <section aria-label="section">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="d_profile de-flex">
                  <div className="de-flex-col">
                    <div className="profile_avatar">
                      <img
                        src={author?.authorImage || AuthorImage}
                        alt={author?.authorName || ""}
                      />

                      <i className="fa fa-check"></i>
                      <div className="profile_name">
                        <h4>
                          {loading
                            ? "Loading..."
                            : author?.authorName || "Monica Lucas"}
                          <span className="profile_username">
                            @{author?.tag || "monicaaaa"}
                          </span>
                          <span id="wallet" className="profile_wallet">
                            {author?.address ||
                              "UDHUHWudhwd78wdt7edb32uidbwyuidhg7wUHIFUHWewiqdj87dy7"}
                          </span>
                          <button id="btn_copy" title="Copy Text">
                            Copy
                          </button>
                        </h4>
                      </div>
                    </div>
                  </div>

                  <div className="profile_follow de-flex">
                    <div className="de-flex-col">
                      <div className="profile_follower">
                        {followers} followers
                      </div>
                      <button
                        className="btn-main"
                        onClick={handleFollow}
                        style={{ border: "none", cursor: "pointer" }}
                      >
                        {isFollowing ? "Unfollow" : "Follow"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-12">
                <div className="de_tab tab_simple">
                  <AuthorItems />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Author;