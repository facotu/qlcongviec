"use client";

import { useEffect, useState, useCallback } from "react";
import { ApiHealthResponse } from "@/types";
import { apiClient } from "./api-client";

export function useHealth() {
  const [healthData, setHealthData] = useState<ApiHealthResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const res = await apiClient<ApiHealthResponse>("/api/health");
    if (res.error) {
      setError(res.error);
      setHealthData(null);
    } else if (res.data) {
      setHealthData(res.data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  return { healthData, isLoading, error, refetch: checkHealth };
}
