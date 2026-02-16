import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { productsAPI, settingsAPI } from "../services/api";

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const scrollContainerRef = useRef(null);

  const [businessData, setBusinessData] = useState({
    businessName: "Advait Collections",
    tagline: "Premium Garments & Fashion Accessories",
    address: { fullAddress: "Vijayapura, Karnataka" },
    phoneNumbers: [{ number: "+91 9876543210", isPrimary: true }],
    emails: [{ email: "contact@advaitcollections.com", isPrimary: true }],
    businessHours: {
      monday: { open: "10:00", close: "20:00", closed: false },
    },
  });

  useEffect(() => {
    fetchProducts();
    fetchBusiness();

    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await productsAPI.getAllProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("Using empty products (API issue)");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBusiness = async () => {
    try {
      const res = await settingsAPI.getSettings();
      if (res.success && res.settings) {
        setBusinessData(res.settings);
      }
    } catch {
      console.log("Using default business data");
    }
  };

  const primaryPhone =
    businessData.phoneNumbers?.find((p) => p.isPrimary) ||
    businessData.phoneNumbers?.[0];

  const primaryEmail =
    businessData.emails?.find((e) => e.isPrimary) ||
    businessData.emails?.[0];

  const formatTime = (time) => {
    if (!time) return "";
    const [h, m] = time.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    return `${hour % 12 || 12}:${m} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary"></div>
        <p className="mt-3">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      {/* HERO */}
      <section className="bg-dark text-white py-5">
        <div className="container">
          <h1 className="display-5 fw-bold">{businessData.businessName}</h1>
          <p className="lead">{businessData.tagline}</p>

          <span className="badge bg-primary me-2">
            {formatTime(businessData.businessHours?.monday?.open)} -
            {formatTime(businessData.businessHours?.monday?.close)}
          </span>
        </div>
      </section>

      {/* PRODUCTS */}
      <div className="container py-5">
        <h2 className="mb-4">Featured Products</h2>

        {products.length === 0 ? (
          <div className="alert alert-warning">
            No products available.
          </div>
        ) : (
          <div className="row">
            {products.slice(0, 4).map((product) => (
              <div key={product._id} className="col-md-3 mb-4">
                <Link to={`/product/${product._id}`} className="text-decoration-none">
                  <div className="card h-100 shadow-sm">
                    <img
                      src={
                        product.image ||
                        "https://images.unsplash.com/photo-1523381210434-271e8be1f52b"
                      }
                      className="card-img-top"
                      alt={product.name}
                    />
                    <div className="card-body">
                      <h6 className="card-title">{product.name}</h6>
                      <p className="fw-bold text-primary">
                        ₹{product.sellingRate}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* STORE INFO */}
      <div className="bg-light py-5">
        <div className="container">
          <h3>Store Information</h3>
          <p>{businessData.address?.fullAddress}</p>

          {primaryPhone && (
            <p>
              📞 <a href={`tel:${primaryPhone.number}`}>{primaryPhone.number}</a>
            </p>
          )}

          {primaryEmail && (
            <p>
              ✉️{" "}
              <a href={`mailto:${primaryEmail.email}`}>
                {primaryEmail.email}
              </a>
            </p>
          )}
        </div>
      </div>

      {/* BACK TO TOP */}
      {showBackToTop && (
        <button
          onClick={() =>
            window.scrollTo({ top: 0, behavior: "smooth" })
          }
          className="btn btn-primary position-fixed"
          style={{ bottom: "20px", right: "20px" }}
        >
          ↑
        </button>
      )}
    </div>
  );
}

export default Home;
