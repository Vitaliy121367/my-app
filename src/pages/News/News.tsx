import React, { useEffect, useState } from "react";
import { Navbar } from "../../components/Navbar/Navbar";
import { Footer } from "../../components/Footer/Footer";
import Loader from "../../components/Loader/Loader";
import styles from "./News.module.css";

interface NewsItem {
    title: string;
    summary: string;
    image?: string;
    url?: string;
    date: string;
}

export const News = () => {
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
                const API_KEY = "pub_a071761da1964d07b5963f72ba6b181b";

                const res = await fetch(
                    `https://newsdata.io/api/1/latest?apikey=${API_KEY}&qInTitle=video game`
                );

                const data = await res.json();

                const newsItems: NewsItem[] = data.results.map((item: any) => ({
                    title: item.title || "No title",
                    summary: item.description || "",
                    image: item.image_url || "",
                    url: item.link || "",
                    date: item.pubDate || new Date().toISOString(),
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
                minHeight: "100vh"
            }}
        >
            <Navbar />
            {loading && <Loader />}
            {!loading && error && (
                <div className="text-danger text-center py-5">{error}</div>
            )}
            {!loading && !error && (
                <div className="container py-4">
                    <h1 className={styles.title}>Video Games News</h1>
                    {news.length > 0 ? (
                        <div className="row g-4">
                            {news.map((item, index) => (
                                <div key={index} className="col-sm-6 col-md-4 col-lg-3">
                                    <div className={`card ${styles.card}`}>
                                        <div className={styles.imageWrapper}>
                                            <img
                                                src={item.image || "https://via.placeholder.com/300x180"}
                                                alt={item.title}
                                                loading="lazy"
                                            />
                                        </div>

                                        <div className="card-body d-flex flex-column">
                                            <h5 className={`card-title ${styles.titleText}`}>
                                                {item.title}
                                            </h5>

                                            <p className={`card-text ${styles.summary}`}>
                                                {item.summary}
                                            </p>

                                            <p className={styles.date}>
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
            <Footer />
        </div>
    );
};