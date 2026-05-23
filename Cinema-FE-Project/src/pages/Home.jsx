import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Hero from "../components/landingPage/Hero";
import TicketPreview from "../components/landingPage/TicketPreview";
import MovieGrid from "../components/landingPage/MovieGrid";
import Promotions from "../components/landingPage/Promotions";
import ComingSoon from "../components/landingPage/ComingSoon";
import CinemaMap from "../components/landingPage/CinemaMap";
import Vouchers from "../components/landingPage/Vouchers";
import AdvanceFilter, { applyFilters } from "../components/landingPage/AdvanceFilter";
import { movieService } from "../services/movieService";

export default function Home() {
    const [allNowShowing, setAllNowShowing] = useState([]);
    const [allComingSoon, setAllComingSoon] = useState([]);
    const [genres, setGenres] = useState([]);
    const [filters, setFilters] = useState({});
    const location = useLocation();
    const navigate = useNavigate();

    // Fetch genres
    useEffect(() => {
        fetch(`${import.meta.env.VITE_BACKEND_URL || "https://cinema-ticket-booking-system-3.onrender.com"}/api/genres`)
            .then((r) => r.ok ? r.json() : null)
            .then((data) => { if (data?.data) setGenres(data.data); })
            .catch(() => { });
    }, []);

    useEffect(() => {
        if (!location.state?.focusMovies) return;
        const t = window.setTimeout(() => {
            document.getElementById("movies")?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
            navigate(location.pathname + location.search + location.hash, {
                replace: true,
                state: {},
            });
        }, 150);
        return () => window.clearTimeout(t);
    }, [location.state, location.pathname, location.search, location.hash, navigate]);

    useEffect(() => {
        movieService.getMovies()
            .then((data) => {
                const movies = data.data || [];
                setAllNowShowing(movies.filter((m) => m.status === "Now Showing"));
                setAllComingSoon(movies.filter((m) => m.status === "Coming Soon"));
            })
            .catch((err) => console.error("FETCH ERROR:", err));
    }, []);

    const nowShowing = applyFilters(allNowShowing, filters);
    const comingSoon = applyFilters(allComingSoon, filters);
    return (
        <main className="flex-1 pt-24">
            <Hero />
            <TicketPreview />
            <section id="movies" className="scroll-mt-24">
                {/* Advance Filter */}
                <div className="px-6 lg:px-20 pb-2">
                    <AdvanceFilter
                        genres={genres}
                        onFilter={setFilters}
                    />
                </div>
                <MovieGrid movies={nowShowing} />
            </section>
            <Promotions />
            <ComingSoon movies={comingSoon} />
            <Vouchers />
            <CinemaMap />
        </main>
    );
}