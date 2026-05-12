import React, { useEffect, useState } from "react";
import { Navbar } from "../../components/Navbar/Navbar";
import { Footer } from "../../components/Footer/Footer";
import Loader from "../../components/Loader/Loader";
import styles from "../../components/styles.module.css";
import style from "./News.module.css";
import axios from "axios";

interface NewsItem {
    title: string;
    summary: string;
    image?: string;
    url?: string;
    date: string;
}

export const News = () => {
  const apiUrl="https://myfastrunsapi0305-hzekc5edahebbtca.polandcentral-01.azurewebsites.net";
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [bg, setBg] = useState<any>(
        localStorage.getItem("user")
            ? JSON.parse(localStorage.getItem("user") || "{}").background
            : null
    );

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await axios.get(`${apiUrl}/api/new`);

                const newsItems: NewsItem[] = res.data.map((item: any) => ({
                    title: item.title || "No title",
                    summary: item.summary || item.description || "",
                    image: item.image || item.image_url || "",
                    url: item.url || item.link || "",
                    date: item.date || item.pubDate || new Date().toISOString(),
                }));

                setNews(newsItems);
            } catch (err: any) {
                console.error(err);
                setError(err.message || "Error fetching news");
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    return (
  <div
    className={styles.page}
    style={{
      backgroundImage: `url(${bg})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}
  >
    <Navbar />

    <div className={styles.content}>
      {loading && <Loader />}

      {!loading && error && (
        <div className="text-danger text-center py-5">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="container py-4">
          <h1 className={styles.title}>Video Games News</h1>

          {news.length > 0 ? (
            <div className="row g-4">
              {news.map((item, index) => (
                <div key={index} className="col-md-4">
                  <div className={`card ${style.card}`}>
                    <div className={style.imageWrapper}>
                      <img src={item.image} alt={item.title} />
                    </div>

                    <div className="card-body d-flex flex-column">
                      <h5 className={`card-title ${style.titleText}`}>
                        {item.title}
                      </h5>

                      <p className={`card-text ${style.summary}`}>
                        {item.summary}
                      </p>

                      <p className={style.date}>
                        {new Date(item.date).toLocaleDateString()}
                      </p>

                      {item.url && (
                        <a
                          href={item.url}
                          className="btn btn-primary mt-auto"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Read More
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <h5 className="text-muted">No news available</h5>
            </div>
          )}
        </div>
      )}
    </div>

    <Footer />
  </div>
);
};