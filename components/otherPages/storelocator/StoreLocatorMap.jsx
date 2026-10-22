"use client";

import React, { useEffect, useRef, useState } from "react";
import { Map, Marker, NavigationControl, LngLatBounds, setWorkerUrl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import Supercluster from "supercluster";
import { FiNavigation, FiPhone, FiStar, FiCrosshair, FiMaximize, FiZoomIn, FiZoomOut } from "react-icons/fi";

// Configure MapLibre Web Worker URL at top level
if (typeof window !== "undefined") {
  const origin = window.location.origin ? window.location.origin.replace(/\/$/, "") : "";
  setWorkerUrl(`${origin}/maplibre/maplibre-gl-worker.mjs`);
}

const MAP_STYLE_POSITRON = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

import { calculateDistance, formatTelUri } from "./utils";

export default function StoreLocatorMap({
  stores = [],
  selectedStore = null,
  onSelectStore,
  userLocation = null,
  locating = false,
  onOpenReviews,
  onLocateMe,
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const clusterIndexRef = useRef(null);
  const selectedStoreRef = useRef(selectedStore);
  selectedStoreRef.current = selectedStore;
  const userMarkerRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize MapLibre GL instance (mapcn architecture)
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    if (typeof window !== "undefined") {
      const origin = window.location.origin ? window.location.origin.replace(/\/$/, "") : "";
      setWorkerUrl(`${origin}/maplibre/maplibre-gl-worker.mjs`);
    }

    // Default KSA view
    const initialCenter = userLocation
      ? [userLocation.lng, userLocation.lat]
      : [45.0, 24.0]; // KSA center

    const map = new Map({
      container: mapContainerRef.current,
      style: MAP_STYLE_POSITRON,
      center: initialCenter,
      zoom: userLocation ? 12 : 5.8,
      attributionControl: false,
    });

    // Add navigation controls (Zoom + Compass)
    map.addControl(new NavigationControl({ showCompass: true }), "top-right");

    map.on("load", () => {
      mapRef.current = map;
      setMapLoaded(true);
      setTimeout(() => map.resize(), 100);
    });

    // Auto-resize observer when container dimensions change (e.g. mobile tab switch)
    let resizeObserver = null;
    if (typeof ResizeObserver !== "undefined" && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        if (mapRef.current) {
          mapRef.current.resize();
        }
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update user location marker (pulsing beacon)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    if (!userLocation) {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      return;
    }

    if (!userMarkerRef.current) {
      const userEl = document.createElement("div");
      userEl.className = "user-location-marker";
      userEl.innerHTML = `
        <div class="user-pulse"></div>
        <div class="user-dot"></div>
      `;
      userMarkerRef.current = new Marker({ element: userEl })
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(map);
    } else {
      userMarkerRef.current.setLngLat([userLocation.lng, userLocation.lat]);
    }
  }, [userLocation, mapLoaded]);

  // Center on user location while keeping at least one store in view
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !userLocation || !stores.length) return;

    // Find nearest store to the user
    let nearestStore = null;
    let minDistance = Infinity;

    stores.forEach((s) => {
      const sLat = Number(s.latlng?.latitude);
      const sLng = Number(s.latlng?.longitude);
      if (!isNaN(sLat) && !isNaN(sLng) && sLat !== 0 && sLng !== 0) {
        const d = calculateDistance(userLocation.lat, userLocation.lng, sLat, sLng);
        if (d < minDistance) {
          minDistance = d;
          nearestStore = { ...s, lat: sLat, lng: sLng, distance: d };
        }
      }
    });

    if (nearestStore) {
      // Build a symmetric bounding box centered on userLocation so userLocation is exactly in the center
      const deltaLat = Math.abs(nearestStore.lat - userLocation.lat);
      const deltaLng = Math.abs(nearestStore.lng - userLocation.lng);

      // 40% margin so store pin is clearly visible inside viewport
      const pad = 1.4;
      const dLat = Math.max(deltaLat * pad, 0.015);
      const dLng = Math.max(deltaLng * pad, 0.015);

      const southWest = [userLocation.lng - dLng, userLocation.lat - dLat];
      const northEast = [userLocation.lng + dLng, userLocation.lat + dLat];

      map.fitBounds([southWest, northEast], {
        animate: true,
        duration: 1200,
        padding: 60,
        maxZoom: 15.5,
      });
    } else {
      map.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 13,
        duration: 1000,
      });
    }
  }, [userLocation, mapLoaded, stores]);

  // Cluster-aware marker rendering function
  const updateClusters = () => {
    const map = mapRef.current;
    const clusterIndex = clusterIndexRef.current;
    if (!map || !clusterIndex) return;

    const bounds = map.getBounds();
    const zoom = Math.floor(map.getZoom());

    const west = Math.max(-180, bounds.getWest());
    const south = Math.max(-85, bounds.getSouth());
    const east = Math.min(180, bounds.getEast());
    const north = Math.min(85, bounds.getNorth());

    let features = [];
    try {
      features = clusterIndex.getClusters([west, south, east, north], zoom);
    } catch {
      features = clusterIndex.getClusters([-180, -85, 180, 85], zoom);
    }

    const currentMarkers = markersRef.current;
    const newKeys = new Set();
    const currentSelected = selectedStoreRef.current;

    features.forEach((feature) => {
      const [lng, lat] = feature.geometry.coordinates;
      const isCluster = feature.properties.cluster;

      if (isCluster) {
        const clusterId = feature.properties.cluster_id;
        const count = feature.properties.point_count;
        const key = `cluster_${clusterId}_${count}`;
        newKeys.add(key);

        if (currentMarkers[key]) return;

        let sizeClass = "cluster-sm";
        if (count >= 50) sizeClass = "cluster-lg";
        else if (count >= 10) sizeClass = "cluster-md";

        const el = document.createElement("div");
        el.className = `store-cluster-pin ${sizeClass}`;
        el.innerHTML = `<span>${count}</span>`;

        el.addEventListener("click", (e) => {
          e.stopPropagation();
          try {
            const expansionZoom = Math.min(
              clusterIndex.getClusterExpansionZoom(clusterId),
              16
            );
            map.easeTo({
              center: [lng, lat],
              zoom: expansionZoom,
              duration: 650,
            });
          } catch {
            map.easeTo({
              center: [lng, lat],
              zoom: map.getZoom() + 2,
              duration: 500,
            });
          }
        });

        const marker = new Marker({ element: el, anchor: "center" })
          .setLngLat([lng, lat])
          .addTo(map);

        currentMarkers[key] = marker;
      } else {
        const store = feature.properties.store;
        const storeKey = store.locationName || store.storeCode;
        const key = `store_${storeKey}`;
        newKeys.add(key);

        const isSelected =
          currentSelected &&
          (currentSelected.locationName === store.locationName ||
            currentSelected.storeCode === store.storeCode);

        if (currentMarkers[key]) {
          const el = currentMarkers[key].getElement();
          if (el) {
            el.classList.toggle("selected", Boolean(isSelected));
          }
          return;
        }

        const el = document.createElement("div");
        el.className = `store-map-pin ${isSelected ? "selected" : ""}`;
        el.dataset.storeKey = key;
        el.innerHTML = `
          <div class="metal-pin-container">
            <div class="metal-pin-head">
              <img
                src="/assets/images/about/ahmed-logo-no-name.png"
                alt="Ahmed Al Maghribi"
                class="metal-pin-logo"
                width="18"
                height="18"
                draggable="false"
                loading="eager"
              />
            </div>
            <div class="metal-pin-collar"></div>
            <div class="metal-pin-shaft"></div>
          </div>
        `;

        el.addEventListener("click", (e) => {
          e.stopPropagation();
          onSelectStore?.(store);
        });

        const marker = new Marker({ element: el, anchor: "bottom" })
          .setLngLat([lng, lat])
          .addTo(map);

        currentMarkers[key] = marker;
      }
    });

    // Remove obsolete markers that are no longer in viewport/zoom
    Object.keys(currentMarkers).forEach((key) => {
      if (!newKeys.has(key)) {
        currentMarkers[key].remove();
        delete currentMarkers[key];
      }
    });
  };

  // Build Supercluster index and bind map movement listener
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const points = stores
      .map((store) => {
        const lat = Number(store.latlng?.latitude);
        const lng = Number(store.latlng?.longitude);
        if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) return null;
        return {
          type: "Feature",
          properties: {
            store,
            key: store.locationName || store.storeCode,
          },
          geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
        };
      })
      .filter(Boolean);

    const SuperclusterConstructor = Supercluster.default || Supercluster;
    const clusterIndex = new SuperclusterConstructor({
      radius: 60,
      maxZoom: 14,
    });
    clusterIndex.load(points);
    clusterIndexRef.current = clusterIndex;

    updateClusters();

    map.on("moveend", updateClusters);

    // If no user location and not single store selected, fit bounds to filtered stores
    if (!userLocation && !selectedStore && stores.length > 0) {
      const bounds = new LngLatBounds();
      let count = 0;
      stores.forEach((s) => {
        const lat = Number(s.latlng?.latitude);
        const lng = Number(s.latlng?.longitude);
        if (!isNaN(lat) && !isNaN(lng) && lat !== 0) {
          bounds.extend([lng, lat]);
          count++;
        }
      });
      if (count > 0) {
        map.fitBounds(bounds, { padding: 60, maxZoom: 14, duration: 800 });
      }
    }

    return () => {
      map.off("moveend", updateClusters);
    };
  }, [stores, mapLoaded]);

  // Keep selection state updated when selectedStore changes
  useEffect(() => {
    updateClusters();
  }, [selectedStore]);

  // When a store is selected, smoothly fly to it
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !selectedStore) return;

    const lat = Number(selectedStore.latlng?.latitude);
    const lng = Number(selectedStore.latlng?.longitude);
    if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) return;

    map.flyTo({
      center: [lng, lat],
      zoom: 15.5,
      essential: true,
      duration: 1000,
    });
  }, [selectedStore, mapLoaded]);

  return (
    <div className="mapcn-container position-relative w-100 h-100 rounded-4 overflow-hidden border shadow-sm">
      <div ref={mapContainerRef} className="mapcn-canvas-target" />

      {/* Floating Recenter / Locate Button */}
      {onLocateMe && (
        <button
          type="button"
          onClick={onLocateMe}
          disabled={locating}
          className="mapcn-floating-btn shadow-sm"
          title="Center on my location"
        >
          {locating ? (
            <span
              className="spinner-border spinner-border-sm text-warning"
              role="status"
              style={{ width: "14px", height: "14px", borderWidth: "1.5px" }}
            />
          ) : (
            <FiCrosshair size={18} />
          )}
          <span className="floating-text">
            {locating ? "Locating..." : userLocation ? "Near Me ✓" : "Near Me"}
          </span>
        </button>
      )}

      {/* Map watermark / badge */}
      <div className="mapcn-badge">
        <span>MapLibre • OpenStreetMap</span>
      </div>
    </div>
  );
}
