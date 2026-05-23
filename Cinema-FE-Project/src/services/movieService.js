import { API_BASE_URL } from "../config/api";

const BASE_URL = API_BASE_URL;

export const movieService = {

    async getMovies() {
        const res = await fetch(`${BASE_URL}/movies`);

        if (!res.ok) {
            throw new Error("Failed to fetch movies");
        }

        return res.json();
    },

    async getMovieByUUID(uuid) {
        const res = await fetch(`${BASE_URL}/movies/uuid/${uuid}`);

        if (!res.ok) {
            throw new Error("Failed to fetch movie detail");
        }

        return res.json();
    },

    async searchMovies(query, options = {}) {
        const limit = options.limit != null ? options.limit : 10;
        const url = `${BASE_URL}/movies/search?q=${encodeURIComponent(query)}&limit=${limit}`;
        const res = await fetch(url);

        if (!res.ok) {
            throw new Error(`Search failed: ${res.status}`);
        }

        return res.json();
    }

};
