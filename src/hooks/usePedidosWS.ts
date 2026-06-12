
import { useEffect, useRef } from "react";
import { useWSStore } from "../store/wsStore";
import { API_BASE } from "../config/api";
import type { WSEventoPedido } from "../models/Pedido";


const WS_URL = `${API_BASE.replace(/^http/, "ws")}/pedidos/ws`;
const MAX_ATTEMPTS = 10;

interface Opciones {
  subscribeOrderId?: number;
}

export function usePedidosWS(
  onEvento: (e: WSEventoPedido) => void,
  opciones: Opciones = {},
  habilitado = true,
) {
  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const onEventoRef = useRef(onEvento);
  onEventoRef.current = onEvento;

  const { subscribeOrderId } = opciones;

  useEffect(() => {
    if (!habilitado) return;

    let attempts = 0;
    let cerradoPorUnmount = false;
    const { setStatus, setAttempts, setLastEvent } = useWSStore.getState();

    const connect = () => {
      const token = localStorage.getItem("token") ?? "";
      setStatus(attempts === 0 ? "connecting" : "reconnecting");
      setAttempts(attempts);

      const ws = new WebSocket(`${WS_URL}?token=${token}`);
      wsRef.current = ws;

      ws.onopen = () => {

        attempts = 0;
        setStatus("connected");
        setAttempts(0);

        if (subscribeOrderId) {
          ws.send(
            JSON.stringify({
              action: "subscribe-order",
              order_id: subscribeOrderId,
            }),
          );
        }
      };

      ws.onclose = (e) => {

        if (cerradoPorUnmount) return;

        setStatus("closed");

        if (e.code === 1008) return;

        if (attempts >= MAX_ATTEMPTS) return;

        const delay = Math.min(
          30_000,
          1000 * 2 ** attempts,
        );

        attempts += 1;

        timerRef.current = setTimeout(
          connect,
          delay,
        );
      };

      ws.onerror = (e) => {
        ws.close();
      };

      ws.onmessage = (msg) => {
        try {
          const data = JSON.parse(msg.data);

          if (data.event === "SUBSCRIBED" || data.event === "ERROR") return;

          if (typeof data.pedido_id === "number") {
            setLastEvent(data);
            onEventoRef.current(data as WSEventoPedido);
          }
        } catch {
        }
      };
    };

    connect();

    return () => {
      cerradoPorUnmount = true;
      clearTimeout(timerRef.current);
      wsRef.current?.close();
      useWSStore.getState().setStatus("idle");
    };
  }, [habilitado, subscribeOrderId]);
}
