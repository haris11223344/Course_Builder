import { useEffect, useState, useRef } from "react";
import { GenerationEvent } from "@/types";
import { API_BASE_URL } from "@/lib/constants";

export const useWebSocket = (courseId?: string) => {
  const [event, setEvent] = useState<GenerationEvent | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!courseId) return;

    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = API_BASE_URL.replace(/^https?:\/\//, "");
    const wsUrl = `${wsProtocol}//${host}/api/v1/courses/${courseId}/generation-status`;

    const socket = new WebSocket(wsUrl);
    wsRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    socket.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data) as GenerationEvent;
        setEvent(data);
      } catch (err) {
        console.error("Failed to parse websocket message", err);
      }
    };

    socket.onerror = () => {
      setError("WebSocket connection failed, attempting stream fallback.");
      // SSE Fallback
      const eventSource = new EventSource(`${API_BASE_URL}/api/v1/courses/${courseId}/generation-stream`);
      eventSource.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data) as GenerationEvent;
          setEvent(data);
        } catch {}
      };
      eventSource.onerror = () => {
        eventSource.close();
      };
    };

    socket.onclose = () => {
      setIsConnected(false);
    };

    return () => {
      socket.close();
    };
  }, [courseId]);

  return { event, isConnected, error };
};
