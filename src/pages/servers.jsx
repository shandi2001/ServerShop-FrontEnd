import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./servers.css";

import cloud from "../Assets/cloud_photo.png";
import nvme from "../Assets/nvme_photo.png";
import windows from "../Assets/widows_photo.png";

import API from "../api/axiosInstance";
import { readCart, writeCart } from "../utils/cart";

const Servers = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeType, setActiveType] = useState("vps");
  const [activeUsage, setActiveUsage] = useState("all");
  const [dealType, setDealType] = useState("rent");

  const [servers, setServers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");

    if (
      tab === "vps" ||
      tab === "vps-nvme" ||
      tab === "cloud" ||
      tab === "windows"
    ) {
      setActiveType(tab);
    }
  }, [location]);

  /*
   * ==============================
   * Get real data from Backend
   * ==============================
   */
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        setError("");

        const [serversResponse, packagesResponse] = await Promise.all([
          API.get("/servers"),
          API.get("/packages"),
        ]);

        // Both endpoints answer { status, results, data: { doc } }
        const serversData = serversResponse?.data?.data?.doc;
        const packagesData = packagesResponse?.data?.data?.doc;

        setServers(Array.isArray(serversData) ? serversData : []);
        setPackages(Array.isArray(packagesData) ? packagesData : []);
      } catch (err) {
        console.error("Failed to load servers/packages:", err);

        setServers([]);
        setPackages([]);

        setError(
          err?.response?.data?.message ||
            "Unable to load servers and packages.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, []);

  /*
   * Convert Backend type name into the
   * values already used by the frontend tabs.
   */
  const normalizeType = (typeName) => {
    const value = String(typeName || "")
      .trim()
      .toLowerCase();

    switch (value) {
      case "vps":
        return "vps";

      case "vps-nvme":
      case "vps nvme":
      case "nvme":
        return "vps-nvme";

      case "cloud":
        return "cloud";

      case "windows":
        return "windows";

      default:
        return "";
    }
  };

  /*
   * Deal tab -> Backend Package.durationType
   *
   * rent   -> monthly
   * yearly -> yearly
   * buy    -> purchase
   */
  const DURATION_BY_DEAL = {
    rent: "monthly",
    yearly: "yearly",
    buy: "purchase",
  };

  // Rental length in days, used for Order.item.duration
  const DAYS_BY_DEAL = {
    rent: 30,
    yearly: 365,
    buy: 0,
  };

  /*
   * Backend category is already:
   * economic / medium / large / professional
   *
   * So we no longer need the old tierMap.
   */
  const filteredPackages = packages.filter((pkg) => {
    /*
     * Find the real server belonging to this package.
     *
     * Package.serverId is an ObjectId for USER requests.
     * Server._id is the real MongoDB ID.
     */
    /*
     * For ADMIN requests the Backend populates serverId, so it arrives as an
     * object; for USER requests it is a plain ObjectId. Normalize before comparing.
     */
    const pkgServerId = pkg?.serverId?._id ?? pkg?.serverId;

    const server = servers.find(
      (item) => String(item?._id || "") === String(pkgServerId || ""),
    );

    if (!server) {
      return false;
    }

    /*
     * Determine server type from Backend:
     *
     * server.typeId.name
     */
    const serverType = normalizeType(server?.typeId?.name);

    if (serverType !== activeType) {
      return false;
    }

    /*
     * Deal type filter.
     *
     * Without this every durationType shows at once, so the same package
     * appears three times at three different prices.
     */
    if (pkg?.durationType !== DURATION_BY_DEAL[dealType]) {
      return false;
    }

    /*
     * Backend package must be available.
     */
    if (pkg?.isAvailable === false) {
      return false;
    }

    /*
     * Backend server must also be available.
     */
    if (server?.isAvailable === false) {
      return false;
    }

    // Package category filter
    if (activeUsage !== "all") {
      const packageCategory = String(pkg?.category || "")
        .trim()
        .toLowerCase();

      if (packageCategory !== activeUsage) {
        return false;
      }
    }
    return true;
  });

  /*
   * ==============================
   * Type information
   * ==============================
   *
   * The text is presentation content,
   * while the actual server/package data
   * comes from Backend.
   */
  const getTypeContent = () => {
    switch (activeType) {
      case "vps":
        return {
          title: "Standard Linux VPS Servers",
          desc: "Dedicated resources and full root access to install and manage your apps on popular Linux distributions such as Ubuntu, Debian, and CentOS. Ideal for developers and stable websites.",
          img: cloud,
        };

      case "vps-nvme":
        return {
          title: "High-Speed VPS NVMe Servers",
          desc: "Powered by the latest NVMe SSD technology for ultra-fast read/write performance that exceeds standard servers by up to 10x. Built for complex applications and high-volume databases.",
          img: nvme,
        };

      case "cloud":
        return {
          title: "Cloud Elastic Infrastructure",
          desc: "Distributed cloud servers across multiple data centers for full stability and 99.9% uptime. Scale memory and CPU instantly as traffic grows without downtime.",
          img: cloud,
        };

      case "windows":
        return {
          title: "Dedicated Windows Servers (Windows RDP)",
          desc: "Complete Windows environments with official licensing and a fast remote desktop setup. Perfect for ASP.NET apps, SQL Server workloads, and business tools.",
          img: windows,
        };

      default:
        return {
          title: "",
          desc: "",
          img: "",
        };
    }
  };

  /*
   * ==============================
   * Add REAL Backend Package to Cart
   * ==============================
   */
  const handleAddToCart = (pkg) => {
    const savedUser = localStorage.getItem("servergo_user");

    if (!savedUser) {
      Swal.fire({
        icon: "warning",
        title: "please log in first !",
        text: "sorry, u cant buy or rent until log in ",
        confirmButtonText: "log in now",
        confirmButtonColor: "red",
      }).then(() => {
        localStorage.setItem("open_login_now", "true");
        window.location.reload();
      });

      return;
    }

    let user;

    try {
      user = JSON.parse(savedUser);
    } catch {
      Swal.fire({
        icon: "error",
        title: "Session Error",
        text: "Please log in again.",
      });

      return;
    }

    const cartItems = readCart(user);

    /*
     * The REAL package ID is now the identity
     * of the cart item.
     */
    const uniqueCartId = `${pkg._id}-${dealType}`; // pkg._id already differs per durationType

    const isExist = cartItems.find((item) => item.cartId === uniqueCartId);

    if (isExist) {
      Swal.fire({
        icon: "info",
        title: "actually found",
        text: "sorry, this package actually in cart",
        confirmButtonColor: "#673de6",
      });

      return;
    }

    const finalPrice = Number(pkg.price);

    const finalName = `${pkg.name} (${dealType === "buy" ? "buy" : "rent"})`;

    /*
     * IMPORTANT:
     *
     * packageId = REAL MongoDB Package._id
     *
     * dealType = used later by payment.jsx
     */
    cartItems.push({
      cartId: uniqueCartId,

      // Real Package ID
      packageId: pkg._id,
      serverId: pkg.serverId,

      // Kept for compatibility if another part
      // of the frontend still uses id.
      id: pkg._id,

      name: finalName,

      ram: `${pkg.ram}GB RAM`,

      storage: `${pkg.storage}GB`,

      cpu: pkg.cpu,

      price: finalPrice,

      // Order.item.type only accepts "buy" or "rent"
      dealType: dealType === "buy" ? "buy" : "rent",

      // 30 days monthly, 365 yearly, 0 for a one-time purchase
      duration: DAYS_BY_DEAL[dealType],
    });

    writeCart(user, cartItems);

    window.dispatchEvent(new Event("cartUpdated"));

    Swal.fire({
      icon: "success",
      title: "added successfully",
      showCancelButton: true,
      confirmButtonColor: "#673de6",
      cancelButtonColor: "#64748b",
      confirmButtonText: "go to cart and pay",
      cancelButtonText: "continue seerfing",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/cart");
      }
    });
  };

  const currentTypeInfo = getTypeContent();

  return (
    <div className="servers-page-wrapper">
      {/* ====== description section ======= */}
      <div className="server_disc d-flex">
        <img
          src={currentTypeInfo.img}
          alt={currentTypeInfo.title}
          className="server_image"
        />

        <div className="discreption">
          <h3>
            About <span>{currentTypeInfo.title}</span>
          </h3>

          <p>{currentTypeInfo.desc}</p>
        </div>
      </div>

      {/* ====== Deal Type ====== */}
      <div className={`deal-slider-container ${dealType}`}>
        <div className="deal-slider-glider"></div>

        <div
          className={`deal-tab ${dealType === "rent" ? "active" : ""}`}
          onClick={() => setDealType("rent")}
        >
          <i className="fa-solid fa-clock"></i>
          <span>Monthly Rental (Rent)</span>
        </div>

        <div
          className={`deal-tab ${dealType === "yearly" ? "active" : ""}`}
          onClick={() => setDealType("yearly")}
        >
          <i className="fa-solid fa-calendar-check"></i>
          <span>Yearly Rental</span>
        </div>

        <div
          className={`deal-tab ${dealType === "buy" ? "active" : ""}`}
          onClick={() => setDealType("buy")}
        >
          <i className="fa-solid fa-gem"></i>
          <span>One-Time Purchase (Buy)</span>
        </div>
      </div>

      {/* ====== Filters ====== */}
      <div className="d-flex justify-content-center flex-wrap gap-2">
        <button
          className={`btn-filter-use ${activeUsage === "all" ? "active" : ""}`}
          onClick={() => setActiveUsage("all")}
        >
          All
        </button>

        <button
          className={`btn-filter-use ${
            activeUsage === "economic" ? "active" : ""
          }`}
          onClick={() => setActiveUsage("economic")}
        >
          Budget
        </button>

        <button
          className={`btn-filter-use ${
            activeUsage === "medium" ? "active" : ""
          }`}
          onClick={() => setActiveUsage("medium")}
        >
          Standard
        </button>

        <button
          className={`btn-filter-use ${
            activeUsage === "large" ? "active" : ""
          }`}
          onClick={() => setActiveUsage("large")}
        >
          Large
        </button>

        <button
          className={`btn-filter-use ${
            activeUsage === "professional" ? "active" : ""
          }`}
          onClick={() => setActiveUsage("professional")}
        >
          Professional
        </button>
      </div>

      {/* ====== Cards ====== */}
      <div className="card_container">
        {loading ? (
          <div className="col-12 text-center py-5">
            <h3>Loading servers...</h3>
          </div>
        ) : error ? (
          <div className="col-12 text-center py-5">
            <div className="no-servers-found-box">
              <i className="fa-solid fa-triangle-exclamation"></i>

              <h3>Unable to load servers!</h3>

              <p>{error}</p>
            </div>
          </div>
        ) : filteredPackages.length > 0 ? (
          filteredPackages.map((pkg) => {
            const pkgServerId = pkg?.serverId?._id ?? pkg?.serverId;

            const server = servers.find(
              (item) => String(item?._id || "") === String(pkgServerId || ""),
            );

            return (
              <div className="server-deployment-card" key={pkg._id}>
                <h3 className="server-package-name">{pkg.name}</h3>

                <ul className="server-hardware-specs-list">
                  <li>
                    <i className="fa-solid fa-microchip"></i> CPU{" "}
                    <b>{pkg.cpu}</b>
                  </li>

                  <li>
                    <i className="fa-solid fa-memory"></i> RAM{" "}
                    <b>{pkg.ram}GB RAM</b>
                  </li>

                  <li>
                    <i className="fa-solid fa-hard-drive"></i> Storage{" "}
                    <b>{pkg.storage}GB</b>
                  </li>

                  <li>
                    <i className="fa-solid fa-server"></i> Server{" "}
                    <b>{server?.name || "Unavailable"}</b>
                  </li>
                </ul>

                <div className="card-bottom-price-action">
                  <div className="price-display-wrapper">
                    <span className="price-number">{pkg.price}</span>

                    <span className="dollar-currency">$</span>

                    {dealType === "rent" && (
                      <span className="price-period">/month</span>
                    )}

                    {dealType === "yearly" && (
                      <span className="price-period">/year</span>
                    )}
                  </div>

                  <button
                    className="btn-deploy-server-now"
                    onClick={() => handleAddToCart(pkg)}
                  >
                    <i className="fa-solid fa-bolt-lightning"></i> Order Now
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-12 text-center py-5 animate-fade">
            <div className="no-servers-found-box">
              <i className="fa-solid fa-triangle-exclamation"></i>

              <h3>No servers available!</h3>

              <p>
                Sorry, there are no servers matching the selected filters in
                this category. Please choose another option.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Servers;
