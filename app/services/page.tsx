"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { API_BASE } from "@/app/context/auth-context";
import { useRouter } from "next/navigation";

// ─── Types ─────────────────────────────────────────────────────────
interface Category {
  id: number;
  name: string;
  description: string;
}

interface ServiceCategory {
  id: number;
  name: string;
  description: string;
}

interface Service {
  id: number;
  name: string;
  shortDescription: string;
  fullDescription: string;
  imageUrl: string;
  price: number;
  category: ServiceCategory;
}

interface PaginatedResult {
  data: Service[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ─── Service Modal Component ───────────────────────────────────────
function ServiceModal({
  service,
  onClose,
}: {
  service: Service;
  onClose: () => void;
}) {
  const router = useRouter();

  const handleBook = () => {
    onClose();
    const token = localStorage.getItem("token");
    const serviceNameParam = encodeURIComponent(service.name);
    const bookingPath = `/booking?serviceId=${service.id}&serviceName=${serviceNameParam}`;

    if (!token) {
      router.push(`/login?redirect=${encodeURIComponent(bookingPath)}`);
    } else {
      router.push(bookingPath);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full h-48 md:h-64">
          <img
            src={service.imageUrl}
            alt={service.name}
            className="w-full h-full object-cover rounded-t-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-t-2xl" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 transition-colors shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="absolute bottom-4 left-6">
            <h2 className="text-xl md:text-2xl font-bold text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {service.name}
            </h2>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <div className="mb-6">
            <p className="text-xl font-bold" style={{ color: "var(--gold)", fontFamily: "'Cormorant Garamond', serif" }}>
              ₦{service.price.toLocaleString()}
            </p>
          </div>

          <div className="text-sm leading-relaxed" style={{ color: "var(--muted)", fontFamily: "'Outfit', sans-serif", fontWeight: 300 }}>
            {service.fullDescription.split('\n').map((paragraph, idx) => (
              <p key={idx} className="mb-3">{paragraph}</p>
            ))}
          </div>

          <div className="mt-8">
            <button
              onClick={handleBook}
              className="w-full text-white font-medium py-2.5 px-6 rounded transition-colors text-sm"
              style={{ background: "var(--gold)", fontFamily: "'Outfit', sans-serif" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#b8985e")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--gold)")}
            >
              Book Consultation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Services Page ────────────────────────────────────────────
export default function ServicesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const fluid = {
    pagePadding: "clamp(16px, 4vw, 80px)",
    sectionTitle: "clamp(28px, 3.5vw, 52px)",
    eyebrow: "clamp(10px, 0.8vw, 13px)",
    body: "clamp(13px, 1vw, 17px)",
    gap: "clamp(8px, 1vw, 16px)",
  };

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);

    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll, categories]);

  useEffect(() => {
    fetch(`${API_BASE}/api/Category`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setCategories(data.data);
          if (data.data.length > 0 && selectedCategory === null) {
            setSelectedCategory(data.data[0].id);
          }
        }
      })
      .catch((err) => console.error("Failed to fetch categories:", err));
  }, []);

  useEffect(() => {
    if (!selectedCategory) return;
    setLoading(true);

    const url = `${API_BASE}/api/Service/category/${selectedCategory}?pageNumber=${currentPage}&pageSize=10`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          const paginated: PaginatedResult = data.data;
          setServices(paginated.data);
          setCurrentPage(paginated.currentPage);
          setTotalPages(paginated.totalPages);
          setTotalCount(paginated.totalCount);
        } else {
          setServices([]);
          setTotalPages(1);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load services. Please try again.");
        setLoading(false);
        console.error(err);
      });
  }, [selectedCategory, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCategoryChange = (categoryId: number) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = 200;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const handleBookClick = (service: Service) => {
    const token = localStorage.getItem("token");
    const serviceNameParam = encodeURIComponent(service.name);
    const bookingPath = `/booking?serviceId=${service.id}&serviceName=${serviceNameParam}`;

    if (!token) {
      window.location.href = `/login?redirect=${encodeURIComponent(bookingPath)}`;
    } else {
      window.location.href = bookingPath;
    }
  };

  return (
    <main style={{ overflowX: "hidden", minHeight: "100vh", background: "var(--warm)" }}>
      <section style={{
        padding: `${fluid.pagePadding}`,
        paddingTop: "clamp(24px, 3vw, 40px)",
        paddingBottom: "clamp(16px, 2vw, 28px)",
        background: "var(--warm)",
      }}>
        <div style={{ width: "min(95%, 1400px)", margin: "0 auto" }}>
          <p style={{
            fontSize: fluid.eyebrow,
            letterSpacing: "clamp(2px, 0.3vw, 4px)",
            color: "var(--gold)",
            textTransform: "uppercase",
            marginBottom: "8px",
            fontWeight: 400,
            fontFamily: "'Outfit', sans-serif",
          }}>
            What We Offer
          </p>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: fluid.sectionTitle,
            fontWeight: 300,
            color: "var(--text)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            margin: 0,
          }}>
            Our Services
          </h1>
        </div>
      </section>

      <section style={{
        padding: `0 ${fluid.pagePadding}`,
        paddingBottom: "clamp(20px, 3vw, 40px)",
        background: "var(--warm)",
      }}>
        <div style={{ width: "min(95%, 1400px)", margin: "0 auto" }}>
          <div className="relative">
            {canScrollLeft && (
              <button
                onClick={() => scroll("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-1.5 hover:bg-gray-50 transition-colors border"
                style={{ borderColor: "var(--border)" }}
                aria-label="Scroll left"
              >
                <svg className="w-3.5 h-3.5" style={{ color: "var(--text)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            {canScrollRight && (
              <button
                onClick={() => scroll("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-1.5 hover:bg-gray-50 transition-colors border"
                style={{ borderColor: "var(--border)" }}
                aria-label="Scroll right"
              >
                <svg className="w-3.5 h-3.5" style={{ color: "var(--text)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
            <div
              ref={scrollRef}
              className="flex gap-3 overflow-x-auto scrollbar-hide px-1 py-1"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  style={{
                    flexShrink: 0,
                    padding: "clamp(8px, 1vw, 12px) clamp(16px, 2vw, 28px)",
                    background: selectedCategory === cat.id ? "var(--gold)" : "#fff",
                    color: selectedCategory === cat.id ? "#fff" : "var(--text)",
                    border: "0.5px solid var(--border)",
                    borderRadius: "3px",
                    fontSize: fluid.body,
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: selectedCategory === cat.id ? 500 : 400,
                    cursor: "pointer",
                    transition: "all 0.25s",
                    letterSpacing: "0.4px",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    if (selectedCategory !== cat.id) {
                      e.currentTarget.style.borderColor = "var(--gold)";
                      e.currentTarget.style.color = "var(--gold)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCategory !== cat.id) {
                      e.currentTarget.style.borderColor = "var(--border)";
                      e.currentTarget.style.color = "var(--text)";
                    }
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{
        padding: `0 ${fluid.pagePadding}`,
        paddingBottom: fluid.pagePadding,
        background: "var(--warm)",
      }}>
        <div style={{ width: "min(95%, 1400px)", margin: "0 auto" }}>
          {loading && (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
              Loading services...
            </div>
          )}
          {error && (
            <div style={{
              background: "#ffebee",
              border: "0.5px solid #ef5350",
              borderRadius: "4px",
              padding: "16px",
              marginBottom: "20px",
              fontSize: fluid.body,
              color: "#c62828",
              textAlign: "center",
            }}>
              {error}
            </div>
          )}
          {!loading && !error && services.length === 0 && selectedCategory && (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
              No services found.
            </div>
          )}
          {!loading && !error && services.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" style={{ gap: fluid.gap }}>
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="bg-white border border-[var(--border)] rounded-md overflow-hidden cursor-pointer transition-all duration-200 hover:border-[var(--gold)] hover:shadow-md"
                    onClick={() => setSelectedService(service)}
                  >
                    <div className="relative w-full" style={{ paddingBottom: "60%" }}>
                      <img
                        src={service.imageUrl}
                        alt={service.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3 sm:p-4">
                      <h3 className="text-base sm:text-lg font-normal mb-1.5" style={{ 
                        fontFamily: "'Cormorant Garamond', serif",
                        color: "var(--text)",
                        lineHeight: 1.2,
                      }}>
                        {service.name}
                      </h3>
                      <p className="text-xs sm:text-sm mb-3 line-clamp-2" style={{ 
                        color: "var(--muted)",
                        fontFamily: "'Outfit', sans-serif",
                        fontWeight: 300,
                        lineHeight: 1.5,
                      }}>
                        {service.shortDescription || 'No description available.'}
                      </p>
                      <div className="text-sm sm:text-base font-medium mb-3" style={{ 
                        color: "var(--text)",
                        fontFamily: "'Cormorant Garamond', serif",
                      }}>
                        ₦{service.price.toLocaleString()}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookClick(service);
                        }}
                        className="w-full py-2 text-xs sm:text-sm font-medium text-white rounded transition-colors"
                        style={{ 
                          background: "var(--gold)",
                          fontFamily: "'Outfit', sans-serif",
                          letterSpacing: "0.4px",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#b8985e";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "var(--gold)";
                        }}
                      >
                        Book
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-10 flex-wrap">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    style={{ borderColor: "var(--border)", color: currentPage === 1 ? "#ccc" : "var(--text)" }}
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className="px-3 py-2 border rounded text-sm transition-colors min-w-[40px]"
                      style={{ 
                        borderColor: "var(--border)",
                        background: currentPage === page ? "var(--gold)" : "#fff",
                        color: currentPage === page ? "#fff" : "var(--text)",
                      }}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    style={{ borderColor: "var(--border)", color: currentPage === totalPages ? "#ccc" : "var(--text)" }}
                  >
                    Next
                  </button>
                </div>
              )}

              <p className="text-center mt-4 text-xs" style={{ color: "var(--muted)", fontFamily: "'Outfit', sans-serif" }}>
                Showing {services.length} of {totalCount} services
              </p>
            </>
          )}
        </div>
      </section>

      {selectedService && (
        <ServiceModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}
    </main>
  );
}