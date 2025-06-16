"use client";

import React, { useEffect, useRef, useState } from "react";
import Script from "next/script";

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiKey = "AIzaSyCm7Ne-wj3NSJMHr33IKTHJTQ2Wnggoouw";

  useEffect(() => {
    if (isScriptLoaded) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log("現在位置:", latitude, longitude);

          const map = new window.google.maps.Map(mapRef.current!, {
            center: { lat: latitude, lng: longitude },
            zoom: 15,
          });

          const service = new window.google.maps.places.PlacesService(map);

          const request = {
            location: { lat: latitude, lng: longitude },
            radius: 1500,
            keyword: "トイレ",
            type: "toilet",
          };

          service.nearbySearch(request, (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
              const nearest = results[0];
              const location = nearest.geometry?.location;
              if (location) {
                new window.google.maps.Marker({
                  position: location,
                  map,
                  title: nearest.name,
                });
              }
            } else {
              console.log("検索失敗:", status);
            }
          });
        },
        (err) => {
          console.error("位置情報取得失敗:", err);
          setError("位置情報取得に失敗しました");
        }
      );
    }
  }, [isScriptLoaded]);

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`}
        onLoad={() => setIsScriptLoaded(true)}
      />
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div ref={mapRef} style={{ width: "100vw", height: "100vh" }} />
    </>
  );
}
