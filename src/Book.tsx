import { useState, useEffect, useCallback } from "react";

interface Book {
  id: string;
  author?: string;
  publisher?: string;
  volumeInfo: {
    title: string;
    description: string;
    imageLinks?: {
      thumbnail: string;
    };
  };
}

interface ApiResponse {
  items?: Book[];
}

export default function Products() {
  const [query, setQuery] = useState<string>("JavaScript");
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [debouncedQuery, setDebouncedQuery] = useState<string>(query);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  const fetchBooks = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setBooks([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    setBooks([]);
    const API = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
      searchTerm
    )}`;
    try {
      const response = await fetch(API);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data: ApiResponse = await response.json();
      setBooks(data.items || []);
      if (!data.items || data.items.length === 0) {
        setError("No books found for this search term.");
      }
    } catch (err) {
      console.error("Error fetching books:", err);
      setError("Failed to fetch books. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks(debouncedQuery);
  }, [debouncedQuery, fetchBooks]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetchBooks(query);
  };

  return (
    <section
      className="bg-[#e6e0d2] min-h-screen p-4 flex flex-col items-center"
      role="region"
      aria-label="Book search results"
    >
      <form
        onSubmit={handleSearch}
        className="w-full max-w-3xl flex flex-wrap mb-6"
        aria-label="Search form"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for books..."
          className="flex-1 p-3 rounded-l border border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <button
          type="submit"
          className="p-3 bg-blue-600 text-white rounded-r hover:bg-blue-700 transition w-full md:w-auto"
        >
          Search
        </button>
      </form>

      {isLoading && (
        <div className="text-center mb-4">
          <p className="text-xl font-semibold font-mono">Loading books...</p>
        </div>
      )}

      {error && (
        <div className="text-center mb-4 text-red-600 max-w-2xl">
          <p className="text-xl font-mono">{error}</p>
        </div>
      )}

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 px-4 w-full max-w-7xl">
        {books.length === 0 && !isLoading && !error && (
          <p className="col-span-full text-center text-lg font-semibold font-mono">
            No books found. Try searching for something else!
          </p>
        )}
        {books.map((book) => (
          <figure
            key={book.id}
            className="bg-white p-4 rounded shadow hover:shadow-lg transition-transform duration-300 transform hover:scale-102"
          >
            {book.volumeInfo.imageLinks?.thumbnail && (
              <img
                src={book.volumeInfo.imageLinks.thumbnail}
                alt={book.volumeInfo.title}
                className="mx-auto mb-3 rounded"
              />
            )}
            <figcaption>
              <h3 className="text-xl font-mono mb-2 text-center font-semibold">
                {book.volumeInfo.title}
              </h3>
              <p className="text-sm font-mono text-center">
                {book.volumeInfo.description || "No description available"}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
